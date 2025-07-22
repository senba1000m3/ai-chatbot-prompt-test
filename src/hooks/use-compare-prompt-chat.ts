"use client";
import { useCallback, useTransition } from "react";
import { usePromptStore } from "@/lib/store/prompt";
import { ensureError } from "@/lib/response";
import { generate } from "@/lib/chat/prompt-action";
import { generate as generateAccuracy } from "@/lib/chat/compare-action";
import { nanoid } from "@/lib/utils";
import type { CoreMessage } from "ai";
import type { ModelMessage } from "@/lib/store/prompt";

// const mergeSystemPrompts = () => {
// 	const { systemPrompt, isSystemPromptOn } = usePromptStore.getState();
// 	const currentPrompts: string[] = [];
//
// 	Object.entries(systemPrompt).forEach(([key, prompt]) => {
// 		if (isSystemPromptOn[key]) {
// 			currentPrompts.push("\n【" + key + "】");
// 			currentPrompts.push(prompt);
// 		}
// 	});
//
// 	return currentPrompts.join("\n").trim();
// };

export function useComparePromptChat() {
	const [, startChatTransition] = useTransition();
	const {
		compareVersions,
		appendCompareModelMessage,
		compareSelectedModel,
		compareModelMessages,
		updateVersionAccuracy,
	} = usePromptStore();

	const sendMessage = async ({ modelName, userMessage }: { modelName: string, userMessage: ModelMessage }) => {
		compareVersions.forEach(version => {
			appendCompareModelMessage(version.id, modelName, userMessage);
		});

		const assistantMessageIds = compareVersions.map(version =>
			appendCompareModelMessage(version.id, modelName, {
				role: "assistant",
				content: "......",
				id: nanoid(),
			})
		);

		startChatTransition(async () => {
			try {
				const messagePromises = compareVersions.map(async (version, idx) => {
					const currentPrompts: string[] = [];
					Object.entries(version.data.systemPrompt).forEach(([key, prompt]) => {
						currentPrompts.push("\n【" + key + "】");
						currentPrompts.push(prompt);
					});

					try {
						const history = usePromptStore.getState().compareModelMessages[version.id]?.[modelName] || {};
						const historyMessages = Object.values(history);

						const result = await generate({
							modelName: modelName,
							messages: historyMessages as CoreMessage[],
							systemPrompt: currentPrompts.join("\n").trim(),
						});

						return {
							versionId: version.id,
							modelName: modelName,
							success: true,
							result: result?.text,
							spendTime: result?.spendTime,
							assistantMessageId: assistantMessageIds[idx],
						};
					} catch (err) {
						const error = ensureError(err);
						return {
							versionId: version.id,
							modelName: modelName,
							success: false,
							error: error.message,
							assistantMessageId: assistantMessageIds[idx],
						};
					}
				});

				const results = await Promise.all(messagePromises);

				results.forEach(({ versionId, modelName, success, result, error, spendTime, assistantMessageId }) => {
					if (success) {
						appendCompareModelMessage(versionId, modelName, {
							id: assistantMessageId,
							role: "assistant",
							content: result,
							spendTime: spendTime,
						});
					} else {
						appendCompareModelMessage(versionId, modelName, {
							id: assistantMessageId,
							role: "assistant",
							content: `Error: ${error || "Unknown error"}`,
						});
					}
				});

				const accuracyPromises = results.map(async (result) => {
					if (result.success) {
						const { versionId, modelName } = result;
						const version = usePromptStore.getState().compareVersions.find(v => v.id === versionId);
						if (!version) return;

						const history = usePromptStore.getState().compareModelMessages[versionId]?.[modelName] || {};
						const historyMessages = Object.values(history);

						const systemPrompt = Object.entries(version.data.systemPrompt)
							.map(([key, prompt]) => `\n【${key}】\n${prompt}`)
							.join("\n").trim();

						try {
							const originalAccuracy = version.modelAccuracy.find(ma => ma.model === modelName)?.accuracy || 0;
							const accuracyResult = await generateAccuracy({
								messages: historyMessages as CoreMessage[],
								systemPrompt: systemPrompt,
								originalAccuracy: originalAccuracy,
							});
							const accuracy = accuracyResult.accuracy;
							console.log(version.name, accuracy);
							if (!isNaN(accuracy)) {
								updateVersionAccuracy(versionId, modelName, accuracy);
							}
						} catch (e) {
							console.error(`Failed to get accuracy for ${modelName} in version ${versionId}`, e);
						}
					}
				});

				await Promise.all(accuracyPromises);

			} catch (e) {
				console.error("Failed to send messages in comparison mode:", e);
			}
		});
	};

	const addModelAccuracyToModel = () => {
		compareVersions.forEach(version => {
			const exists = version.modelAccuracy.some(m => m.model === compareSelectedModel);
			if (!exists) {
				version.modelAccuracy.push({
					model: compareSelectedModel,
					accuracy: 0
				});
			}
		});
	};

	const handleSubmit = async (input: string) => {
		if (!input.trim()) {
			return;
		}

		addModelAccuracyToModel()

		const userMessage: ModelMessage = {
			role: "user",
			content: input,
			id: nanoid(),
		};

		await sendMessage({
			modelName: compareSelectedModel,
			userMessage: userMessage,
		});
	};

	return {
		handleSubmit,
	};
}

