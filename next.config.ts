import createNextIntlPlugin from "next-intl/plugin";

// Types & Interfaces
import type { NextConfig } from "next";



const nextConfig: NextConfig = {
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
				],
			},
			{
				source: "/sw.js",
				headers: [
					{
						key: "Content-Type",
						value: "application/javascript; charset=utf-8",
					},
					{
						key: "Cache-Control",
						value: "no-cache, no-store, must-revalidate",
					},
					{
						key: "Content-Security-Policy",
						value: "default-src 'self'; script-src 'self'",
					},
				],
			},
		]
	},
	// devIndicators: {
	// 	position: "bottom-right",
	// },
	devIndicators: false,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "feiax0ct75.ufs.sh",  // TAI V4 (Common)
				pathname: "/f/**",
			},
			{
				protocol: "https",
				hostname: "hackmd.io",
				pathname: "/_uploads/**",
			},
		]
	},
	turbopack: {
		resolveAlias: {
			"micromark-extension-math": "micromark-extension-llm-math",
		},
	},
	webpack: (config) => {
		config.resolve.alias = {
			...config.resolve.alias,
			"micromark-extension-math": "micromark-extension-llm-math",
		};
		return config;
	},
};

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");
export default withNextIntl(nextConfig);