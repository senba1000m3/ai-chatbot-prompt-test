import { generatePreviewMetadata, getFullTitle } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

// Components & UI
import { ChatSidebar } from "@/components/main/chat/sidebar";
import { ChatLayoutHeader } from "@/components/main/chat/chat-header";
import { ChatResizablePanel } from "@/components/main/chat/chat-panel";
import { BlockResizablePanel } from "@/components/main/chat/block-panel";
import { ResizablePanelGroup } from "@/components/ui/resizable";
import { SidebarProvider } from "@/components/ui/sidebar";

// Types & Interfaces
import type { Metadata } from "next";
import type { LocaleParam } from "@/types";

// Metadata
const url = "/chat";
export async function generateMetadata(
	{ params }: { params: LocaleParam }
): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "layout.chat" });

	const title = t("title");
	const description = t("description");
	return {
		title,
		description,
		...generatePreviewMetadata({
			title: getFullTitle(title),
			description,
			url,
		}),
		robots: {
			index: false,
			follow: false,
		}
	};
};



export default async function ChatLayout({ children }: React.ComponentProps<"main">) {
	return (
		<SidebarProvider className="h-svh">
			<ChatSidebar />
			<main className="flex-1">
				<ChatLayoutHeader className="h-12" />
				<ResizablePanelGroup
					className="h-[calc(100svh_-_3rem)]!"
					direction="horizontal"
				>
					<ChatResizablePanel
						defaultSize={70}
						minSize={30}
						order={1}
					>
						{children}
					</ChatResizablePanel>
					<BlockResizablePanel
						defaultSize={30}
						minSize={30}
						order={2}
					/>
				</ResizablePanelGroup>
			</main>
		</SidebarProvider>
	);
}