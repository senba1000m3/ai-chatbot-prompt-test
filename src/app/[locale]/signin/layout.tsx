import { generatePreviewMetadata, getFullTitle } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

// Types & Interfaces
import type { Metadata } from "next";
import type { LocaleParam } from "@/types";

// Metadata
const url = "/signin";
const keywords: string[] = [];
export async function generateMetadata(
	{ params }: { params: LocaleParam }
): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "layout.signin" });

	return {
		title: t("title"),
		description: t("description"),
		keywords,
		...generatePreviewMetadata({
			title: getFullTitle(t("title")),
			description: t("description"),
			url,
		}),
		robots: {
			index: true,
			follow: true,
			nocache: false,
		},
	};
};



export default function SignInLayout({ children }: React.ComponentProps<"main">) {
    return <main>{children}</main>;
}