import { customAlphabet } from "nanoid";

// shadcn
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";



export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function getBaseUrl() {
	const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
		? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
		: `https://localhost:${process.env.PORT || 3000}`;
	return new URL(baseUrl);
}

export function getFullTitle(title: string | undefined): string {
	const name = "Project τ";
	return title ? `${title}｜${name}` : name;
}

export function generatePreviewMetadata(
	{ title, description = "", url }: { title: string; description?: string; url: string }
) {
	return {
		openGraph: {
			title,
			description,
			url,
			siteName: title,
			type: "website",
			locale: "zh_TW",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			site: "@OutegralStudio",
			siteId: "1631300792928854023",
			creator: "@OutegralStudio",
			creatorId: "1631300792928854023",
		},
	};
}

export function nanoid(length: number = 16): string {
	const nanoidAlphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const nanoidGenerator = customAlphabet(nanoidAlphabet, length);
	return nanoidGenerator();
}