"use client";
import { useCallback, useTransition } from "react";
import { usePromptStore } from "@/lib/store/prompt";
import { ensureError } from "@/lib/response";
import { generate } from "@/lib/chat/prompt-action";
import { nanoid } from "@/lib/utils";
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
	} = usePromptStore();

	const sendMessage = async ({ modelName, userMessage }: { modelName: string, userMessage: ModelMessage }) => {
		compareVersions.forEach(version => {
			appendCompareModelMessage(version.id, modelName, userMessage);
		});

		startChatTransition(async () => {
			try {
				const messagePromises = compareVersions.map(async (version) => {
					const currentPrompts: string[] = [];
					Object.entries(version.data.systemPrompt).forEach(([key, prompt]) => {
						currentPrompts.push("\n【" + key + "】");
						currentPrompts.push(prompt);
					});

					try {
						const historyMessages = usePromptStore.getState().compareModelMessages[version.id]?.[modelName] || {};
						const history = Object.values(historyMessages);

						const result = await generate({
							modelName: modelName,
							messages: history,
							systemPrompt: currentPrompts.join("\n").trim(),
						});

						return {
							versionId: version.id,
							modelName: modelName,
							success: true,
							result: result?.text,
							spendTime: result?.spendTime,
						};
					} catch (err) {
						const error = ensureError(err);
						return {
							versionId: version.id,
							modelName: modelName,
							success: false,
							error: error.message
						};
					}
				});

				const results = await Promise.all(messagePromises);

				results.forEach(({ versionId, modelName, success, result, error, spendTime }) => {
					if (success) {
						appendCompareModelMessage(versionId, modelName, {
							id: nanoid(),
							role: "assistant",
							content: result,
							spendTime: spendTime,
						});
					} else {
						appendCompareModelMessage(versionId, modelName, {
							id: nanoid(),
							role: "assistant",
							content: `Error: ${error || "Unknown error"}`,
						});
					}
				});
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

