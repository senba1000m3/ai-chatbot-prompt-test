"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useChatStore } from "@/lib/store/chat";
import { useToolStore } from "@/lib/store/tool";
import { useTranslations } from "next-intl";
import { match } from "ts-pattern";
import { cn, copyToClipboard } from "@/lib/utils";
import { getChatModel } from "@/lib/chat/models";

// SWR
import useSWRImmutable from "swr/immutable";
import fetcher from "@/lib/fetcher";
import { mutate } from "swr";

// Components & UI
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CopyButton, FileTextButton } from "@/components/common/motion-buttons";
import { MarkdownText, Muted } from "@/components/common/typography";
import { Message, MessageContent, MessageGroup } from "@/components/ui/message";

// Icons & Images
import { ExternalLink, LoaderPinwheel } from "lucide-react";

// Types & Interfaces
import type { CoreMessage } from "ai";
import type { Message as ChatMessage } from "@/lib/db/schema";
import type { FetcherOptions } from "@/lib/fetcher";
import { SourcePart } from "@/types/chat";



export function ChatMessages({ chatId }: { chatId: string }) {
	return (
		<MessageGroup className="gap-8">
			<InitialMessages chatId={chatId} />
			<CurrentMessages />
			<LoadingMessage />
		</MessageGroup>
	);
}

function LoadingMessage() {
	const isLoading = useChatStore(state => state.isLoading);

	return isLoading ? (
		<Message
			className="group [div[data-role=user]+&]:mt-2"
			side="left"
			showAvatar
			keepAvatarSpace
			data-role="assistant"
		>
			<MessageContent>
				<LoaderPinwheel className="size-6 text-muted-foreground animate-spin duration-200" />
			</MessageContent>
		</Message>
	) : null;
}

function InitialMessages({ chatId }: { chatId: string }) {
	// ! Only fetch once, since you would get new messages using useSWR
	const swrKey = chatId
		? ["/api/messages", { params: { chat_id: chatId } } satisfies FetcherOptions]
		: null;
	// TODO: isLoading and error handling
	const { data } = useSWRImmutable<{ data: ChatMessage[] }>(
		// @ts-expect-error fxxk fetcher type
		swrKey, ([url, options]: [string, FetcherOptions]) => fetcher(url, options)
	);

	useEffect(() => { mutate(["/api/messages", { params: { chat_id: chatId } }]) }, [chatId]);

	const messages = (data?.data || [])
		.sort((a, b) => {
			const aUpdatedAt = new Date(a.updatedAt).getTime();
			const bUpdatedAt = new Date(b.updatedAt).getTime();
			return aUpdatedAt - bUpdatedAt;
		});

	return messages.length > 0 ? messages.map(message => (
		<MessageRenderer
			key={message.id}
			id={message.id}
			message={message}
		/>
	)) : null;
}

function CurrentMessages() {
	const messageOrderArray = useChatStore(state => state.messageOrderArray);

	return messageOrderArray.length > 0 ? messageOrderArray.map(messageId => (
		<CurrentMessage key={messageId} id={messageId} />
	)) : null;
}

function CurrentMessage({ id }: { id: string }) {
	const message = useChatStore(state => state.messages[id]);
	const sources = useChatStore(state => state.sources[id]);

	return (
		<MessageRenderer
			key={id}
			id={id}
			message={message}
			sources={sources}
		/>
	);
}

export function MessageRenderer({ id, message, sources, ...props }: {
	id: string;
	message: ChatMessage | CoreMessage;
	sources?: SourcePart["source"][]
} & React.ComponentProps<typeof Message>) {
	const hasToolResultPart =
		Array.isArray(message.content) &&
		message.content.some(part => part.type === "tool-result");

	return !hasToolResultPart ? (
		<Message
			key={id}
			className="group [div[data-role=user]+&]:mt-2"
			side={message.role === "user" ? "right" : "left"}
			showAvatar={message.role !== "user"}
			keepAvatarSpace={message.role !== "user"}
			data-role={message.role}
			{...props}
		>
			<MessageContentRenderer
				variant={message.role === "user" ? "bubble" : "default"}
				className={cn(message.role === "user" && "@2xl/message-group:max-w-[80%]")}
				content={message.content as CoreMessage["content"]}
				sources={sources}
			>
				<MessageToolbarRenderer
					className="opacity-0 group-hover:opacity-100 transition-opacity"
					role={message.role}
					content={message.content as CoreMessage["content"]}
					metadata={"metadata" in message
						? message?.metadata as Record<string, any>
						: {}
					}
				/>
			</MessageContentRenderer>
		</Message>
	): null;
}

function MessageContentRenderer({
	children,
	content,
	sources,
	...props
}: Omit<React.ComponentProps<typeof MessageContent>, "content">
	& { content: CoreMessage["content"]; sources?: SourcePart["source"][] }
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
							className="w-fit my-2"
							onClick={() => {
								setActiveToolResultId(part.toolCallId);
								setIsBlockOpen(true);
							}}
							asChild
						>
							<FileTextButton>
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
			{sources && (
				<div className="flex items-center my-2">
					{sources.map(source => (
						<a
							key={source.id}
							href={source.url}
							title={source.title}
							className="inline-flex items-center justify-center size-8 not-first:-ml-2 bg-primary text-primary-foreground border-2 border-background rounded-full shrink-0"
							target="_blank"
							rel="noopener noreferrer"
						>
							<ExternalLink className="shrink-0 size-4 pointer-events-none" />
						</a>
					))}
				</div>
			)}
			{children}
		</MessageContent>
	);
}

function MessageToolbarRenderer({
	className,
	role,
	content,
	metadata,
}: Omit<React.ComponentProps<"div">, "content">
	& { role: string, content: CoreMessage["content"], metadata?: Record<string, any> }
) {
	const [showIsCopied, setShowIsCopied] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const handleCopy = useCallback(async (code: string) => {
		const copyResult = await copyToClipboard(code);
		match(copyResult)
			.with({ success: true }, () => {
				if (timeoutRef.current) clearTimeout(timeoutRef.current);
				setShowIsCopied(true);
				timeoutRef.current = setTimeout(() => {
					setShowIsCopied(false);
					timeoutRef.current = null;
				}, 3000);
			})
			.with({ success: false }, ({ message }) => {
				toast.error(
					"A small 🤏🌌 issue occurred...",
					{ description: message }
				);
			})
			.exhaustive();
	}, []);

	const stringifiedContent = typeof content === "string"
		? content.trim()
		: (content).map(part => {
			return (part.type === "text")
				? part.text
				: "";
		}).filter(Boolean).join("\n");

	return (
		<div className={cn(
			"absolute bottom-0 flex items-center gap-2 w-full py-1 translate-y-full",
			role === "user"
				? "right-0 justify-end"
				: "left-0",
			className
		)}>
			<Button
				variant="ghost"
				size="icon"
				className="text-accent-foreground"
				onClick={async () => handleCopy(stringifiedContent)}
				asChild
			>
				<CopyButton showIsCopied={showIsCopied} />
			</Button>
			{role === "assistant" && metadata ? (
				<Muted>{getChatModel(metadata?.model)?.name || metadata?.model}</Muted>
			) : null}
		</div>
	);
}