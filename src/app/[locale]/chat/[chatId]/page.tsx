"use client";
import { use, useEffect } from "react";
import { useChatStore } from "@/lib/store/chat";
import { useToolStore } from "@/lib/store/tool";
import { useTranslations } from "next-intl";

// SWR
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

// Components & UI
import { ChatMessages } from "@/components/main/chat/chat-messages";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WrapperLayout } from "@/components/common/layouts";

// Types & Interfaces
import type { ChatParams } from "@/types";
import type { Chat } from "@/lib/db/schema";



export default function ChatPage(props: {
	params: ChatParams,
}) {
	const t = useTranslations("chat.type");
	const params = use(props.params);
	const chatId = params.chatId;

	// @ts-expect-error fxxk fetcher type
	const { data, error } = useSWR<{ data: Chat }>(`/api/chats/${chatId}`, fetcher);
	const chatTitle = data?.data?.title;

	// Handle chat change
	useEffect(() => {
		const handleChatChange = useChatStore.getState().handleChatChange;
		const setIsBlockOpen = useToolStore.getState().setIsBlockOpen;

		handleChatChange(chatId);
		setIsBlockOpen(false);
	}, [chatId]);

	// Set chat title to Zustand store and document
	useEffect(() => {
		const setChatTitle = useChatStore.getState().setChatTitle;

		if (error) {
			const title = t("unknown", { chat: t("chat") });
			setChatTitle(title);
			document.title = title;
		} else {
			const untitled = t("untitled", { chat: t("chat") });
			setChatTitle(chatTitle || untitled);
			document.title = chatTitle || untitled;
		}
	}, [chatTitle, error, t]);

	return (
		<ScrollArea className="size-full" scrollHideDelay={1000}>
			<WrapperLayout className="pt-4 pb-48" width={960}>
				<ChatMessages chatId={chatId} />
			</WrapperLayout>
		</ScrollArea>
	);
}