// Auth
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Components & UI
import ChatLayoutHeader from "@/components/main/chat/header";
import { ScrollArea } from "@/components/ui/scroll-area";

// Types & Interfaces
import { Metadata } from "next";
import { ChatParams } from "@/types";

// Metadata
export async function generateMetadata({ params }: { params: ChatParams }): Promise<Metadata> {
	const chatId = (await params).chatId;

	return {
		title: chatId,
		robots: {
			index: false,
			follow: false,
		},
	};
}



export default async function ChatLayout({ children }: { children: React.ReactNode }) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		const error = encodeURIComponent("Unauthorized");
		redirect(`/signin?error=${error}`);
	}

	return (
		<>
			<ChatLayoutHeader className="h-12" />
			<ScrollArea className="h-[calc(100svh_-_3rem)]" scrollHideDelay={1000}>
				{children}
			</ScrollArea>
		</>
	);
}