import ky, { HTTPError } from "ky";
import { match } from "ts-pattern";
import { ErrorMessage, ensureError } from "@/lib/response";

// Types & Interfaces
import type { Result } from "@/lib/response";
import type { Options as KyOptions } from "ky";
export type FetcherOptions = {
	prefixUrl?: string;
	params?: Record<string, string | number | boolean>;
	method?: KyOptions["method"];
	contentType?: string;
	data?: any;
}



export default async function fetcher(
	url: string,
	{
		prefixUrl = "",
		params = {},
		method = "GET",
		contentType = "application/json",
		data = {},
	}: FetcherOptions = {}
) {
	// Compose options
	const inputUrl = prefixUrl
		? url.startsWith("/")
			? url.slice(1)
			: url
		: url;
	const options: KyOptions = {
		prefixUrl,
		method,
		searchParams: params,
	};

	if (method !== "GET" && method !== "HEAD") {
		match(contentType)
			.with("application/json", () => {
				options.headers = { "Content-Type": "application/json" };
				options.json = data;
			})
			.with("text/plain", () => {
				options.headers = { "Content-Type": "text/plain" };
				options.body = String(data);
			})
			.with("application/x-www-form-urlencoded", () => {
				options.headers = { "Content-Type": "application/x-www-form-urlencoded" };
				options.body = new URLSearchParams(data);
			})
			.with("multipart/form-data", () => {
				// Not important, at least for now
			})
			.otherwise(() => {
				// Not important, at least for now
			});
	}

	try {
		// ! Handle JSON cases only for now
		const response: Result = await ky(inputUrl, options).json();
		const { message } = response;

		match(response)
			.with({ success: false }, () => console.error(message))
			.with({ success: true, level: "info" }, () => console.log(message))
			.with({ success: true, level: "warning" }, () => console.warn(message))
			.exhaustive();

		return {
			...response,
			status: 200
		};
	} catch (err) {
		if (err instanceof HTTPError) {
			const status = err.response.status;
			let msg: string = ErrorMessage.InternalServer;

			try {
				const errorData = await err.response.json();
				if (errorData.message) msg = errorData.message;
			} catch (error) {
				msg = ensureError(error).message;
			}

			const message = `[${status}] ${msg}`;
			console.log("ERR::FETCHER:", message);
			throw new Error(message);
		}

		const error = ensureError(err);
		const message = `[${error.status}] ${error.message}`;
		console.log("ERR::FETCHER:", message);
		throw new Error(message);
	}
}