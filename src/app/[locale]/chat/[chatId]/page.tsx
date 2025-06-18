"use client";
import { use, useEffect, useRef } from "react";
import { useChatStore } from "@/lib/store/chat";
import { useToolStore } from "@/lib/store/tool";
import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";

// Auth
import { useSession } from "@/lib/auth/client";

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
	const { data: session, isPending } = useSession();
	const t = useTranslations("chat.type");
	const params = use(props.params);
	const chatId = params.chatId;

	const setHasScrolledToBottom = useChatStore.getState().setHasScrolledToBottom;
	const scrollAreaRef = useRef<HTMLDivElement>(null);

	// @ts-expect-error fxxk fetcher type
	const { data, isLoading, error } = useSWR<{ data: Chat }>(`/api/chats/${chatId}`, fetcher);
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
		if (isLoading) return;
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
	}, [chatTitle, isLoading, error, t]);

	if (!isPending && !session) {
		const error = encodeURIComponent("Unauthorized");
		redirect(`/signin?error=${error}`);
	}

	// Scroll Area
	useEffect(() => {
		const scrollArea = scrollAreaRef.current;
		if (!scrollArea) return;

		function handleScroll() {
			const scrollArea = scrollAreaRef.current;
			if (!scrollArea) return;

			const isScrollable = scrollArea.scrollHeight > scrollArea.clientHeight;
			const isBottom = scrollArea.scrollHeight - scrollArea.scrollTop <= scrollArea.clientHeight + 1;
			setHasScrolledToBottom(!isScrollable || isBottom);
		}

		scrollArea.addEventListener("scroll", handleScroll);
		return () => scrollArea.removeEventListener("scroll", handleScroll);
	}, [chatId, setHasScrolledToBottom]);

	return (
		<ScrollArea ref={scrollAreaRef} className="size-full" scrollHideDelay={1000}>
			<WrapperLayout className="pt-4 pb-48" width={960}>
				<ChatMessages chatId={chatId} />
			</WrapperLayout>
		</ScrollArea>
	);
}