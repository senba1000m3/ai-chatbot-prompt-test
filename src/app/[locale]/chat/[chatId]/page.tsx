"use client";
import { use } from "react";

// Components & UI
import { WrapperLayout } from "@/components/common/layouts";
import { P } from "@/components/common/typography";

// Types & Interfaces
type Params = Promise<{ chatId: string }>;



export default function ChatPage(props: { params: Params }) {
	const params = use(props.params);
	const chatId = params.chatId;

	return (
		<WrapperLayout className="py-4" width={960}>
			<P>This is the {decodeURIComponent(chatId)} chat page.</P>
		</WrapperLayout>
	);
}