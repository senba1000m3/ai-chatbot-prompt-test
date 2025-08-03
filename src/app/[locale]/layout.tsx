import "@/app/globals.css";
import Providers from "@/lib/providers";
import { getBaseUrl, generatePreviewMetadata } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

// next-intl
import { NextIntlClientProvider } from "next-intl";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/lib/i18n/routing";

// Fonts
import { GeistSans } from "geist/font/sans";
import {
	JetBrains_Mono,
	Noto_Sans_JP,
	Noto_Sans_TC,
	Plus_Jakarta_Sans,
} from "next/font/google";
const JetBrainsMono = JetBrains_Mono({
    weight: "variable",
    style: ["normal"],
    display: "swap",
	subsets: ["latin"],
	variable: "--font-jetbrains-mono",
});
const NotoSansJP = Noto_Sans_JP({
	weight: "variable",
	style: ["normal"],
	display: "swap",
	subsets: ["latin"],
	variable: "--font-noto-sans-jp",
});
const NotoSansTC = Noto_Sans_TC({
	weight: "variable",
	style: ["normal"],
	display: "swap",
	subsets: ["latin"],
	variable: "--font-noto-sans-tc",
});
const PlusJakartaSans = Plus_Jakarta_Sans({
	weight: "variable",
	style: ["normal"],
	display: "swap",
	subsets: ["latin"],
	variable: "--font-plus-jakarta-sans",
});

// Types & Interfaces
import type { Metadata } from "next";
import type { LocaleParam } from "@/types";

// Metadata
const url = "/";
const author = "Outegral Studio, Senba";
const keywords: string[] = [];  // TODO: SEO keywords
export async function generateMetadata(
	{ params }: { params: LocaleParam }
): Promise<Metadata> {
    return {
		metadataBase: getBaseUrl(),
		title: {
			default: "TAI 工廠",
			template: `TAI 工廠｜%s`,
		},
		description: "TAI 工廠是一個專注於 AI 應用與技術分享的平台，提供最新的人工智慧工具與資源。",
		applicationName: "TAI 工廠",
		category: "technology",
		keywords,
		authors: [{ name: author }],
		creator: author,
		publisher: author,
		...generatePreviewMetadata({
			title: "TAI 工廠",
			description: "TAI 工廠是一個專注於 AI 應用與技術分享的平台，提供最新的人工智慧工具與資源。",
			url
		}),
		robots: {
			index: true,
			follow: true,
			nocache: false,
		}
	};
};

export default async function RootLayout({
	children,
	params,
}: React.ComponentProps<"html"> & { params: LocaleParam }) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) notFound();

	setRequestLocale(locale);

	return (
		<html
			lang={locale}
			className={cn(
				GeistSans.variable,
				JetBrainsMono.variable,
				NotoSansJP.variable,
				NotoSansTC.variable,
				PlusJakartaSans.variable,
			)}
			suppressHydrationWarning
		>
			<head>
				{/* <script src="https://unpkg.com/react-scan/dist/auto.global.js" async /> */}
				<link
					rel="stylesheet"
					href="https://cdn.jsdelivr.net/npm/katex@latest/dist/katex.min.css"
				/>
			</head>
			<body>
				<NextIntlClientProvider>
					<Providers>
						{children}
					</Providers>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}

