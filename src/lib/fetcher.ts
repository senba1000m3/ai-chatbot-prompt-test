import ky, { HTTPError } from "ky";
import { match } from "ts-pattern";
import { ErrorMessage } from "./errors";

// Types & Interfaces
import type { Options as KyOptions } from "ky";
export type FetcherOptions = {
	baseUrl?: string;
	params?: Record<string, string | number | boolean>;
	method?: KyOptions["method"];
	contentType?: string;
	data?: Record<string, any>;
}



export default async function fetcher(
	url: string,
	{
		baseUrl = "",
		params = {},
		method = "GET",
		contentType = "application/json",
		data = {},
	}: FetcherOptions = {}
) {
	const fullUrl = baseUrl + url;

	const options: KyOptions = {
		method,
		headers: {
			"Content-Type": contentType,
		},
		searchParams: params,
	};

	if (method !== "GET" && method !== "HEAD") {
		match(contentType)
			.with("application/json", () => {
				options.json = data;
			})
			.otherwise(() => {
				options.body = data;
			});
	}

	try {
		const response = await ky(fullUrl, options).json();
		const { level, message } = response as any;
		if (message) {
			match(level)
				.with("error", () => console.error(message))
				.with("warning", () => console.warn(message))
				.with("info", () => console.log(message))
				.otherwise(() => console.log(message));
		}
		return { ...response, status: 200 };
	} catch (error) {
		if (error instanceof HTTPError) {
			const status = error.response.status;
			let message;
			try {
				const errorData = await error.response.json();
				message = errorData.message || ErrorMessage.InternalServer;
			} catch {
				message = ErrorMessage.InternalServer;
			}
			throw new Error(`[${status}] ${message}`);
		} else {
			throw new Error(`[500] ${ErrorMessage.InternalServer}`);
		}
	}
}