import { getBaseUrl } from "@/lib/utils";

// Types & Interfaces
import type { MetadataRoute } from "next";



export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = getBaseUrl().href;

	return [
		{
			url: baseUrl,
			lastModified: new Date("2025-06-10"),
			changeFrequency: "weekly",
			priority: 1,
			alternates: {
				languages: {
					en: `${baseUrl}/en`,
					ja: `${baseUrl}/ja`,
					"zh-TW": `${baseUrl}/zh-TW`,
				},
			},
		},
		{
			url: `${baseUrl}/signin`,
			lastModified: new Date("2025-06-10"),
			changeFrequency: "monthly",
			priority: 1,
			alternates: {
				languages: {
					en: `${baseUrl}/en/signin`,
					ja: `${baseUrl}/ja/signin`,
					"zh-TW": `${baseUrl}/zh-TW/signin`,
				},
			},
		},
	];
}