import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	locales: ["en", "zh-TW", "ja"],
	defaultLocale: "en",
	localePrefix: "never",
	localeCookie: {
		maxAge: 60 * 60 * 24 * 365,  // 1 year
	},
});