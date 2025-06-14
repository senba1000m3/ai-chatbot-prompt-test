import { useCallback, useTransition } from "react";
import { useChatStore } from "@/lib/store/chat";
import { useToolStore } from "@/lib/store/tool";

import { generate } from "@/lib/chat/actions";
import { receiveStream, receiveObjectStream } from "@/lib/chat/utils";
import { match } from "ts-pattern";

// Constants & Variables
import { CHAT_TOOL_CONFIGS } from "@/lib/chat/tools";

// Types & Interfaces
import type { ChatOptions } from "@/types/chat";



export function useChatManager() {
	const [isChatPending, startChatTransition] = useTransition();
	const [isToolPending, startToolTransition] = useTransition();

	const isLoading = useChatStore(state => state.isLoading);
	const setIsLoading = useChatStore(state => state.setIsLoading);
	const getMessageArray = useChatStore(state => state.getMessageArray);

	// TODO
	const executeTool = useCallback(
		async (toolCallId: string, toolName: string, args: any) => {
			try {
				const tool = CHAT_TOOL_CONFIGS[toolName];
				if (!tool) throw new Error(`ERR::TOOL::EXEC: Invalid tool \`${toolName}\``);

				const { type, useStream, action } = tool;
				match(type)
					.with("inline", () => { return null })
					.with("block", () => {
						const setIsBlockOpen = useToolStore.getState().setIsBlockOpen;
						setIsBlockOpen(true);
					})
					.exhaustive();


				console.log(`TOOL::EXEC: ID: ${toolCallId}, TOOL: ${toolName.toUpperCase()}`);
				const initToolResult = useToolStore.getState().initToolResult;
				initToolResult(toolCallId, toolName);

				startToolTransition(() => {
					if (useStream) {
						void (async () => {
							const objectStreamValue = await action(args);
							receiveObjectStream(objectStreamValue, toolCallId, toolName);
						})();
					} else {
						void (async () => {
							const result = await action(args);
							const appendToolResult = useToolStore.getState().appendToolResult;
							appendToolResult(toolCallId, result);
						})();
					}
				});
			} catch (error) {

			}
		}, []
	);

	const sendMessage = useCallback(
		async ({ chatId, messages: newMessages = [], model, character }: ChatOptions) => {
			startChatTransition(async () => {
				// Here goes a function that converts the enitre block into a message

				const messages = [
					...getMessageArray().slice(0, -1),  // History
					// Block type tool result as message?
					...newMessages,
				];
				const fullStreamValue = await generate({
					chatId,
					messages,
					model,
					character,
				});
				await receiveStream(fullStreamValue, executeTool);
			});
		}, []
	);

	return {
		executeTool,
		sendMessage,
	};
}