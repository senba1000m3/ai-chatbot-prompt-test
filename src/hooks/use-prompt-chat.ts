"use client";
import { useCallback, useTransition } from "react";
import { usePromptStore, type MessageContent } from "@/lib/store/prompt";
import { ensureError } from "@/lib/response";
import { generate } from "@/lib/chat/prompt-action";
import { nanoid } from "@/lib/utils";
import type { CoreMessage } from "ai";
import { readStreamableValue } from "ai/rsc";

const promptDictionary: Record<string, string> = {
	characterSettings: "character-settings",
	selfAwareness: "self-awareness",
	workflow: "workflow",
	formatLimits: "format-limits",
	usedTools: "used-tools",
	repliesLimits: "replies-limits",
	preventLeaks: "prevent-leaks",
};

const mergeSystemPrompts = () => {
	const { systemPrompt, isSystemPromptOn } = usePromptStore.getState();
	const currentPrompts: string[] = [];

	Object.entries(systemPrompt).forEach(([key, prompt]) => {
		if (isSystemPromptOn[key]) {
			const title = promptDictionary[key];
			currentPrompts.push("\n<" + title + ">");
			currentPrompts.push(prompt);
			currentPrompts.push("</" + title + ">\n");
		}
	});

	return currentPrompts.join("\n").trim();
};

export function usePromptChat() {
	const [, startChatTransition] = useTransition();
	const {
		selectedModels,
		appendModelMessage,
		updateModelMessage,
		setModelIsLoading,
		getModelMessages,
	} = usePromptStore();

	const sendMessage = useCallback(
		async ({ modelNames, input, sendTimes, assistantMessageIds }: { modelNames: string[], input?: string, sendTimes?: number, assistantMessageIds: string[] }) => {
			startChatTransition(async () => {
				modelNames.forEach(modelName => {
					setModelIsLoading(modelName, true);
				});

				try {
					const totalPrompts = mergeSystemPrompts();
					const currentSendTimes = sendTimes || usePromptStore.getState().inputSendTimes;
					const selectedImages = usePromptStore.getState().selectedImage;

					for (let i = 0; i < currentSendTimes; i++) {
						// 先 append 一個 user message，內容暫時為空陣列
						const userMessageIds = modelNames.map(modelName =>
							appendModelMessage(modelName, {
								role: "user",
								content: undefined,
							})
						);

						const newAssistantMessageIds = modelNames.map(modelName =>
							appendModelMessage(modelName, {
								role: "assistant",
								content: "......",
							})
						);

						const messagePromises = modelNames.map(async (modelName, idx) => {
							const parameters = usePromptStore.getState().parameters;
							const userContent: MessageContent = [];
							if (input) {
								userContent.push({ type: "text", text: input });
							}
							if (selectedImages && selectedImages.length > 0) {
								selectedImages.forEach(img => {
									userContent.push({ type: "image", image: img });
								});
							}

							console.log(userContent);
							// update user message，把 text/image update 進去
							updateModelMessage(modelName, userMessageIds[idx], {
								content: userContent,
							});

							const historyMessages = getModelMessages(modelName);

							try {
								const result = await generate({
									modelName: modelName,
									messages: historyMessages as CoreMessage[],
									systemPrompt: totalPrompts,
									parameters: parameters,
								});

								return {
									modelName,
									success: true,
									result: result?.text,
									spendTime: result?.spendTime,
									assistantMessageId: newAssistantMessageIds[idx]
								};
							} catch (err) {
								const error = ensureError(err);
								return { modelName, success: false, error: error.message, assistantMessageId: newAssistantMessageIds[idx] };
							}
						});

						const results = await Promise.all(messagePromises);

						results.forEach(({ modelName, success, result, error, spendTime, assistantMessageId }) => {
							if (success) {
								updateModelMessage(modelName, assistantMessageId, {
									content: [{ type: "text", text: result as string }],
									spendTime,
								});
							} else {
								updateModelMessage(modelName, assistantMessageId, {
									content: [{ type: "text", text: `Error: ${error || "Unknown error"}` }],
								});
							}
						});
					}
				}
				finally {
					modelNames.forEach(modelName => {
						setModelIsLoading(modelName, false);
					});
					usePromptStore.getState().setInputSendTimes(1);
				}
			});
		}, [updateModelMessage, setModelIsLoading, getModelMessages]
	);

	const handleSubmit = useCallback(
		async (input: string, sendTimes?: number) => {
			if (!input.trim()) {
				return;
			}

			const currentSelectedModels = usePromptStore.getState().selectedModels;

			if (currentSelectedModels.length === 0) {
				return;
			}

			await sendMessage({
				modelNames: currentSelectedModels,
				input: input,
				assistantMessageIds: [],
			});
		},
		[sendMessage]
	);

	return {
		handleSubmit,
	};
}

