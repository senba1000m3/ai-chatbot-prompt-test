"use client";
import { useCallback, useTransition } from "react";
import { usePromptStore } from "@/lib/store/prompt";
import { ensureError } from "@/lib/response";
import { generate } from "@/lib/chat/prompt-action";
import { nanoid } from "@/lib/utils";
import { readStreamableValue } from "ai/rsc";

export function usePromptChat() {
	const [, startChatTransition] = useTransition();
	const {
		selectedModels,
		appendModelMessage,
		updateModelMessage,
		setModelIsLoading,
		getModelMessages,
	} = usePromptStore();

	const handleSubmit = useCallback(
		async (input: string) => {
			console.log("[usePromptChat] handleSubmit triggered.");
			if (!input.trim()) {
				console.log("[usePromptChat] Input is empty, aborting.");
				return;
			}

			const currentSelectedModels = usePromptStore.getState().selectedModels;
			console.log("[usePromptChat] Current selected models from store:", currentSelectedModels);

			if (currentSelectedModels.length === 0) {
				console.warn("[usePromptChat] No models selected, aborting chat generation.");
				// Optionally, provide user feedback here
				return;
			}

			// Append user message to all selected models
			currentSelectedModels.forEach(modelId => {
				appendModelMessage(modelId, {
					role: "user",
					content: input,
				});
			});

			// For each selected model, start a chat generation
			currentSelectedModels.forEach(modelId => {
				startChatTransition(async () => {
					setModelIsLoading(modelId, true);
					const messages = getModelMessages(modelId);
					console.log(`[usePromptChat] Messages for ${modelId}:`, JSON.stringify(messages, null, 2));

					try {
						const result = await generate({
							modelId: modelId,
							messages: messages,
						});

						let fullResponse = "";
						const assistantMessageId = nanoid();
						appendModelMessage(modelId, {
							id: assistantMessageId,
							role: "assistant",
							content: "",
						});

						const reader = result.textStream.getReader();
						const decoder = new TextDecoder();

						while (true) {
							const { value, done } = await reader.read();
							if (done) {
								// The stream is done. The final value is the metadata.
								const finalData = JSON.parse(decoder.decode(value, { stream: false }) || "{}");
								if (finalData.spendTime) {
									updateModelMessage(modelId, assistantMessageId, { spendTime: finalData.spendTime });
								}
								break;
							}
							const delta = decoder.decode(value, { stream: true });
							fullResponse += delta ?? "";
							updateModelMessage(modelId, assistantMessageId, { content: fullResponse });
						}
					} catch (err) {
						const error = ensureError(err);
						console.error(`ERR::CHAT::${modelId}:`, error.message);
						appendModelMessage(modelId, {
							role: "assistant",
							content: `Error: ${error.message}`,
						});
					} finally {
						setModelIsLoading(modelId, false);
					}
				});
			});
		},
		[appendModelMessage, updateModelMessage, setModelIsLoading, getModelMessages]
	);

	return {
		handleSubmit,
	};
}

