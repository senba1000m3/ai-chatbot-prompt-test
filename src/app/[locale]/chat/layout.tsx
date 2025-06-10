import { generatePreviewMetadata, getFullTitle } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

// Components & UI
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/main/chat/sidebar";

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

	return {
		title: t("title"),
		description: t("description"),
		...generatePreviewMetadata({
			title: getFullTitle(t("title")),
			description: t("description"),
			url,
		}),
		robots: {
			index: false,
			follow: false,
		}
	};
};



export default function ChatLayout({ children }: React.ComponentProps<"main">) {
	return (
		<SidebarProvider className="h-svh">
			<SidebarTrigger className="md:hidden fixed left-0 top-0 size-12" />
			<ChatSidebar />
			<main className="flex-1">
				{children}
			</main>
		</SidebarProvider>
	);
}