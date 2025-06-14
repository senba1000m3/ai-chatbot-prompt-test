import { generatePreviewMetadata, getFullTitle } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

// Auth
import fetcher from "@/lib/fetcher";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Components & UI
import { ChatSidebar } from "@/components/main/chat/sidebar";
import { ChatLayoutHeader } from "@/components/main/chat/chat-header";
import { ChatResizablePanel } from "@/components/main/chat/chat-panel";
import { BlockResizablePanel } from "@/components/main/chat/block-panel";
import { ResizablePanelGroup } from "@/components/ui/resizable";
import { SidebarProvider } from "@/components/ui/sidebar";

// Types & Interfaces
import type { Metadata } from "next";
import type { ChatParams } from "@/types";

// Metadata
const url = "/chat";
export async function generateMetadata(
	{ params }: { params: ChatParams }
): Promise<Metadata> {
	const { locale, chatId } = await params;
	const t = await getTranslations({ locale, namespace: "layout" });

	// TODO: Move to sub layout.tsx
	let title = t("homepage.title");
	if (chatId) {
		const chatData = await fetcher(`/api/chats/${chatId}`);
		const chatTitle = chatData?.data?.title;
		if (chatTitle) title = chatTitle;
	}

	return {
		title,
		description: t("chat.description"),
		...generatePreviewMetadata({
			title: getFullTitle(title),
			description: t("chat.description"),
			url,
		}),
		robots: {
			index: false,
			follow: false,
		}
	};
};



export default async function ChatLayout({ children }: React.ComponentProps<"main">) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		// const error = encodeURIComponent("Unauthorized");
		// redirect(`/signin?error=${error}`);
	}

	return (
		<SidebarProvider className="h-svh">
			<ChatSidebar />
			<main className="flex-1">
				<ChatLayoutHeader className="h-12" />
				<ResizablePanelGroup
					className="h-[calc(100svh_-_3rem)]!"
					direction="horizontal"
				>
					<ChatResizablePanel minSize={30}>
						{children}
					</ChatResizablePanel>
					<BlockResizablePanel minSize={20} />
				</ResizablePanelGroup>
			</main>
		</SidebarProvider>
	);
}