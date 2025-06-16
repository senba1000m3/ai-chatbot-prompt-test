"use client";
import { useChatStore } from "@/lib/store/chat";
import { useToolStore } from "@/lib/store/tool";
import { useTranslations } from "next-intl";
import { match } from "ts-pattern";

// SWR
import useSWRImmutable from "swr/immutable";
import fetcher from "@/lib/fetcher";

// Components & UI
import { Button } from "@/components/ui/button";
import { FileTextButton } from "@/components/common/motion-buttons";
import { MarkdownText } from "@/components/common/typography";
import { Message, MessageContent, MessageGroup } from "@/components/ui/message";

// Types & Interfaces
import type { CoreMessage } from "ai";
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

function InitialMessages({ chatId }: { chatId: string }) {
	// ! Only fetch once, since you would get new messages using useSWR
	const swrKey = chatId
		? ["/api/messages", { params: { chat_id: chatId } } satisfies FetcherOptions]
		: null;
	const { data, error, isLoading } = useSWRImmutable<{ data: ChatMessage[] }>(
		swrKey, ([url, options]: [string, FetcherOptions]) => fetcher(url, options)
	);
	const messages = (data?.data || []).sort((a, b) => {
		const aUpdatedAt = new Date(a.updated_at).getTime();
		const bUpdatedAt = new Date(b.updated_at).getTime();
		return aUpdatedAt - bUpdatedAt;
	});

	return messages.length > 0 ? messages.map((message, index) => (
		<Message
			key={message.id}
			side={message.role === "user" ? "right" : "left"}
				showAvatar={message.role !== "user" && (messages[index - 1]?.role === "user" || !messages[index - 1])}
			keepAvatarSpace={message.role !== "user" && messages[index - 1]?.role !== "user"}
		>
			<RenderedMessageContent
				variant={message.role === "user" ? "bubble" : "default"}
				className={`${message.role === "user" && "@2xl/message-group:max-w-[80%]"}`}
				content={message.content as CoreMessage["content"]}
			/>
		</Message>
	)) : null;
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
				side={message.role === "user" ? "right" : "left"}
				showAvatar={message.role !== "user" && (messages[index - 1]?.role === "user" || !messages[index - 1])}
				keepAvatarSpace={message.role !== "user" && messages[index - 1]?.role !== "user"}
			>
				<RenderedMessageContent
					variant={message.role === "user" ? "bubble" : "default"}
					className={`${message.role === "user" && "@2xl/message-group:max-w-[80%]"}`}
					content={message.content}
				/>
			</Message>
		)
	}) : null;
}

function RenderedMessageContent({
	content,
	...props
}: Omit<React.ComponentProps<typeof MessageContent>, "content">
	& { content: CoreMessage["content"] }
) {
	const t = useTranslations("chat.content");
	const setIsBlockOpen = useToolStore(state => state.setIsBlockOpen);
	const setActiveToolResultId = useToolStore(state => state.setActiveToolResultId);

	if (typeof content === "string") {
		return !content.trim()
			? null
			: (
				<MarkdownText>
					{content.trim()}
				</MarkdownText>
			);
	}

	return (
		<MessageContent {...props}>
			{content.map((part, index) =>
				match(part)
					.with({ type: "text" }, (part) => (
						<MarkdownText key={index}>
							{part.text}
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
					.with({ type: "tool-call", toolName: "step_block" }, (part) => (
						<Button
							key={index}
							variant="outline"
							size="lg"
							className="w-fit"
							onClick={() => {
								setActiveToolResultId(part.toolCallId);
								setIsBlockOpen(true);
							}}
							asChild
						>
							<FileTextButton svgClassName="size-5">
								{t("tools.open_step_blocks")}
							</FileTextButton>
						</Button>
					))
					// TODO: Null for now
					.with({ type: "tool-call" }, () => null)
					// Type `tool-result` messages are only for AI
					.with({ type: "tool-result" }, () => null)
					.exhaustive()
			)}
		</MessageContent>
	);
}