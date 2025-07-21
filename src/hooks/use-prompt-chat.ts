"use client";
import { useCallback, useTransition } from "react";
import { usePromptStore } from "@/lib/store/prompt";
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
		async ({ modelNames, input }: { modelNames: string[], input?: string }) => {
			startChatTransition(async () => {

				modelNames.forEach(modelName => {
					setModelIsLoading(modelName, true);
				});

				try {
					const totalPrompts = mergeSystemPrompts();

					const messagePromises = modelNames.map(async (modelName) => {
						const historyMessages = getModelMessages(modelName);

						try {
							const result = await generate({
								modelName: modelName,
								messages: historyMessages as CoreMessage[],
								systemPrompt: totalPrompts
							});

							return {
								modelName,
								success: true,
								result: result?.text,
								spendTime: result?.spendTime
							};
						} catch (err) {
							const error = ensureError(err);
							return { modelName, success: false, error: error.message };
						}
					});

					const results = await Promise.all(messagePromises);

					results.forEach(({ modelName, success, result, error, spendTime }) => {
						// console.log(modelName+spendTime);
						if (success) {
							appendModelMessage(modelName, {
								id: nanoid(),
								role: "assistant",
								content: result,
								spendTime: spendTime
							});
						} else {
							appendModelMessage(modelName, {
								role: "assistant",
								content: `Error: ${error || "Unknown error"}`,
							});
						}
					});
				}
				finally {
					modelNames.forEach(modelName => {
						setModelIsLoading(modelName, false);
					});
				}
			});
		}, [appendModelMessage, setModelIsLoading, getModelMessages]
	);

	const handleSubmit = useCallback(
		async (input: string) => {
			if (!input.trim()) {
				return;
			}

			const currentSelectedModels = usePromptStore.getState().selectedModels;

			if (currentSelectedModels.length === 0) {
				return;
			}

			currentSelectedModels.forEach(modelName => {
				appendModelMessage(modelName, {
					role : "user",
					content: input,
				});
			});

			await sendMessage({
				modelNames: currentSelectedModels,
				input: input
			});
		},
		[appendModelMessage, sendMessage]
	);

	return {
		handleSubmit,
	};
}


