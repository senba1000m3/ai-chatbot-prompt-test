import { generatePreviewMetadata } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

// Database
import { db } from "@/lib/db/drizzle";

// Types & Interfaces
import type { Metadata } from "next";
import type { ChatParams } from "@/types";

// Metadata
const url = "/chat";
export async function generateMetadata(
	{ params }: { params: ChatParams }
): Promise<Metadata> {
	const { locale, chatId } = await params;
	const t = await getTranslations({ locale, namespace: "layout.homepage" });

	const chatData = await db.query.chats.findFirst({
		where: (chats, { eq }) => eq(chats.id, chatId)
	});

	const title = (chatData?.public && chatData?.title) ? chatData?.title : t("title");
	const description = t("description");
	return {
		title,
		description,
		...generatePreviewMetadata({
			title,
			description,
			url,
		}),
		robots: {
			index: true,
			follow: false,
			nocache: true,
		}
	};
};



export default async function ChatLayout({ children }: React.ComponentProps<"div">) {
	return children;
}