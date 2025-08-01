"use client";
import { useCallback, useTransition } from "react";
import { useRouter } from "@/lib/i18n/navigation";
import { useChatStore } from "@/lib/store/chat";
import { useToolStore } from "@/lib/store/tool";
import { ensureError } from "@/lib/response";
import { mutate } from "swr";

import fetcher from "@/lib/fetcher";
import { match } from "ts-pattern";
import { nanoid } from "@/lib/utils";
import { generate, generateChatMetadata } from "@/lib/chat/actions";
import { receiveStream, receiveObjectStream } from "@/lib/chat/utils";

// Constants & Variables
import { CHAT_TOOL_CONFIGS } from "@/lib/chat/tools";

// Types & Interfaces
import type { CoreUserMessage } from "ai";
import type { ChatOptions } from "@/types/chat";
type HandleSubmitProps = {
	createUserMessagesForAI?: (input: string) => CoreUserMessage[];
	onNewChatCallback?: (newChatId: string) => Promise<void> | void;
};



export function useChatManager() {
	const router = useRouter();

	const [, startChatTransition] = useTransition();
	const [, startToolTransition] = useTransition();

	// TODO: Better everything
	const executeTool = useCallback(
		async (toolCallId: string, toolName: string, args: any) => {
			try {
				// Check if the tool is valid
				const tool = CHAT_TOOL_CONFIGS[toolName];
				if (!tool) throw new Error(`ERR::TOOL::EXEC: Invalid tool \`${toolName}\``);

				// Preparation before tool execution
				const { type, useStream, action } = tool;
				match(type)
					.with("inline", () => { return null })
					.with("block", () => {
						const setIsBlockOpen = useToolStore.getState().setIsBlockOpen;
						setIsBlockOpen(true);
					})
					.exhaustive();

				if (!action) return;

				// Tool execution
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
			} catch (err) {
				const error = ensureError(err);
				console.error("ERR::TOOL::EXEC:", error.message);
			}
		}, []
	);

	const sendMessage = useCallback(
		async ({
			chatId,
			messages: newMessages = [],
			model,
			character,
			useWebSearch,
		}: ChatOptions) => {
			startChatTransition(async () => {
				// TODO: A function that converts the enitre block tool result into a message

				const getMessageArray = useChatStore.getState().getMessageArray;
				const messages = [
					// History messages (but without the latest user message)
					...getMessageArray().slice(0, -1),
					// Block type tool result as message?
					// TODO: Block tool result messages
					// The latest user message should be included here
					...newMessages,
				];

				// Generate and receive the text stream
				const fullStreamValue = await generate({
					chatId,
					messages,
					model,
					character,
					useWebSearch,
				});
				await receiveStream(fullStreamValue, executeTool);
			});
		}, [executeTool]
	);

	const handleSubmit = useCallback(
		async ({
			createUserMessagesForAI,
			onNewChatCallback,
		}: HandleSubmitProps = {}): Promise<void> => {
			const {
				chatId,
				input,
				setInput,
				setIsLoading,
				model,
				character,
				useWebSearch,
				appendMessage,
			} = useChatStore.getState();

			setIsLoading(true);

			// Since we get a copy of input,
			// we can safely clear the input state
			if (!input.trim()) return;
			setInput("");

			// Append the message for UI display
			const message: CoreUserMessage = {
				role: "user",
				content: [{ type: "text", text: input.trim() }],
			};
			appendMessage(message);

			// Create a new chat if no chatId is present,
			// then run the callback
			let finalChatId = chatId;
			if (!finalChatId) {
				finalChatId = nanoid();

				// Push the route first
				router.push(`/chat/${finalChatId}`);

				// POST the chat first
				await fetcher("/api/chats", {
					method: "POST",
					data: { id: finalChatId },
				});

				await onNewChatCallback?.(finalChatId);
			}

			// Then POST the user message, it needs the chatId FK
			await fetcher("/api/messages", {
				method: "POST",
				data: {
					chatId: finalChatId,
					...message,
				},
			});

			// Generate and send the user message for AI
			const messages = createUserMessagesForAI
				? createUserMessagesForAI(input.trim())
				: [message];

			await sendMessage({
				chatId: finalChatId,
				messages,
				model,
				character,
				useWebSearch,
			});

			// Generate a chat title if it's a new chat
			if (!chatId) {
				try {
					// Get all messages including the AI response
					const allMessages = useChatStore.getState().getMessageArray();
					const { title } = await generateChatMetadata({ messages: allMessages });
					const setChatTitle = useChatStore.getState().setChatTitle;
					setChatTitle(title);

					// Update chat title via API
					await fetcher(`/api/chats/${finalChatId}`, {
						method: "PATCH",
						data: { title },
					}).then(() => mutate("/api/chats"));
				} catch (err) {
					const error = ensureError(err);
					console.error("ERR::CHAT::TITLE:", error);
				}
			}

			// TODO: Better state handling
		}, [router, sendMessage]
	);

	return {
		executeTool,
		sendMessage,
		handleSubmit,
	};
}