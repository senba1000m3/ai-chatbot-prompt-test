import { generatePreviewMetadata } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

// Types & Interfaces
import type { Metadata } from "next";
import type { ChatParams } from "@/types";

// Metadata
const url = "/chat";
export async function generateMetadata(
	{ params }: { params: ChatParams }
): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "layout.homepage" });

	const title = t("title");
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
			index: false,
			follow: false,
		}
	};
};



export default async function ChatLayout({ children }: React.ComponentProps<"div">) {
	return children;
}