"use client";
import { useChatStore } from "@/lib/store/chat";
import { useToolStore } from "@/lib/store/tool";
import { match } from "ts-pattern";

// SWR
import useSWRImmutable from "swr/immutable";
import fetcher from "@/lib/fetcher";

// Components & UI
import { Button } from "@/components/ui/button";
import { MarkdownText } from "@/components/common/typography";
import { Message, MessageContent, MessageGroup } from "@/components/ui/message";

// Types & Interfaces
import type { Message as ChatMessage } from "@/lib/db/schema";
import type { FetcherOptions } from "@/lib/fetcher";



export function ChatMessages({ chatId }: { chatId: string }) {
	return (
		<MessageGroup>
			<InitialMessages chatId={chatId} />
			<CurrentMessages />
		</MessageGroup>
	);
}

function CurrentMessages() {
	const messageOrderArray = useChatStore(state => state.messageOrderArray);
	const messages = useChatStore(state => state.messages);

	return messageOrderArray.length > 0 ? messageOrderArray.map((messageId, index) => {
		const message = messages[messageId];
		if (!message) return null;

		return (
			<Message
				key={messageId}
				side={message.role === "assistant" ? "left" : "right"}
				showAvatar={message.role === "assistant" && message.role !== messages[index - 1]?.role}
			>
				<MessageContent
					variant={message.role === "assistant" ? "default" : "bubble"}
					className={`${message.role === "user" && "@2xl/message-group:max-w-[80%]"}`}
				>
					{renderMessageContent( message.content as { type: string }[])}
				</MessageContent>
			</Message>
		)
	}) : null;
}

function InitialMessages({ chatId }: { chatId: string }) {
	// ! Only fetch once, since you would get new messages using useSWR
	const swrKey = chatId
		? ["/api/messages", { params: { chat_id: chatId } } satisfies FetcherOptions]
		: null;
	const { data, error, isLoading } = useSWRImmutable<{ data: ChatMessage[] }>(
		swrKey, ([url, options]: [string, FetcherOptions]) => fetcher(url, options)
	);
	const messages = data?.data || [];

	return messages.length > 0 ? messages.map((message, index) => (
		<Message
			key={message.id}
			side={message.role === "assistant" ? "left" : "right"}
			showAvatar={message.role === "assistant" && message.role !== messages[index - 1]?.role}
			keepAvatarSpace={false}
		>
			<MessageContent
				variant={message.role === "assistant" ? "default" : "bubble"}
				className={`${message.role === "user" && "@2xl/message-group:max-w-[80%]"}`}
			>
				{renderMessageContent( message.content as { type: string }[])}
			</MessageContent>
		</Message>
	)) : null;
}

function renderMessageContent(contentArray: any[]) {
	return contentArray.map((content, index) =>
		match(content)
			.with({ type: "text" }, () => (
				<MarkdownText key={index}>
					{content.text}
				</MarkdownText>
			))
			.with({ type: "image" }, () => (
				<div key={index}>Image content here</div>
			))
			.with({ type: "file" }, () => (
				<div key={index}>File content here</div>
			))
			.with({ type: "reasoning" }, () => (
				<div key={index}>Reasoning content here</div>
			))
			.with({ type: "redacted-reasoning" }, () => (
				<div key={index}>Redacted reasoning content here</div>
			))
			.with({ type: "tool-call" }, () => (
				<div key={index}>Tool call content here</div>
			))
			.with({ type: "tool-result" }, () => (
				<div key={index}>Tool result content here</div>
			))
			.otherwise(() => null)
	);
}

function ToolCallContent(content: any) {

	return match(content)
		.with({ toolName: "step_block" }, () => {
			const isBlockOpen = useToolStore(state => state.isBlockOpen);
			const setIsBlockOpen = useToolStore(state => state.setIsBlockOpen);
			const setActiveToolResultId = useToolStore(state => state.setActiveToolResultId);

			setIsBlockOpen(true);
			return (
				<Button
					variant={isBlockOpen ? "default" : "outline"}
					onClick={() => {
						setActiveToolResultId(content.toolCallId);
						if (!isBlockOpen) setIsBlockOpen(true);
					}}
				>

				</Button>
			);
		})
		.otherwise(() => null);
}