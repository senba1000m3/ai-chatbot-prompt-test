import { customAlphabet } from "nanoid";
import { ensureError } from "./response";

// shadcn
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Types & Interfaces
import type { Metadata } from "next";
export type CopyResult =
	| { success: true }
	| { success: false; message: string };



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
): Partial<Metadata> {
	return {
		openGraph: {
			title,
			description,
			url,
			siteName: title,
			type: "website",
			locale: "en_US",
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

export async function copyToClipboard(text: string): Promise<CopyResult> {
	try {
		await navigator.clipboard.writeText(text);
		return { success: true };
	} catch (err) {
		const error = ensureError(err);
		return { success: false, message: error.message };
	}
}