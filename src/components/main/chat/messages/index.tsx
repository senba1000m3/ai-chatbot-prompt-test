"use client";
import { useEffect } from "react";
import { useChatStore } from "@/lib/store/chat";

// SWR
import useSWRImmutable from "swr/immutable";
import fetcher from "@/lib/fetcher";
import { mutate } from "swr";

// Components & UI
import { Message, MessageContent, MessageGroup } from "@/components/ui/message";
import { MessageRenderer } from "./message-renderer";

// Icons & Images
import { LoaderPinwheel } from "lucide-react";

// Types & Interfaces
import type { Message as ChatMessage } from "@/lib/db/schema";
import type { FetcherOptions } from "@/lib/fetcher";



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
			showAvatar={false}
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