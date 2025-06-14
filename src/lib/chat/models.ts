import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { elevenlabs } from "@ai-sdk/elevenlabs";



export const CHAT_MODELS = {
	OpenAI: {
		provider: openai,
		models: [
			{ model: "o4-mini", image_input: false, pdf_input: false, web_search: false, image_gen: false, reasoning: false },
			{ model: "o3", image_input: false, pdf_input: false, web_search: false, image_gen: false, reasoning: false },
			{ model: "o3-mini", image_input: false, pdf_input: false, web_search: false, image_gen: false, reasoning: false },
			{ model: "gpt-4.1", image_input: false, pdf_input: false, web_search: false, image_gen: false, reasoning: false },
			{ model: "gpt-4.1-mini", image_input: false, pdf_input: false, web_search: false, image_gen: false, reasoning: false },
			{ model: "gpt-4.1-nano", image_input: false, pdf_input: false, web_search: false, image_gen: false, reasoning: false },
			{ model: "gpt-4o", image_input: false, pdf_input: false, web_search: false, image_gen: false, reasoning: false },
			{ model: "gpt-4o-mini", image_input: false, pdf_input: false, web_search: false, image_gen: false, reasoning: false },
		],
	},
	Gemini: {
		provider: google,
		models: [
			{ model: "gemini-2.5-flash-preview-05-20", image_input: false, pdf_input: false, web_search: false, image_gen: false, reasoning: false },
			{ model: "gemini-2.0-pro-exp-02-05", image_input: false, pdf_input: false, web_search: false, image_gen: false, reasoning: false },
			{ model: "gemini-2.0-flash", image_input: false, pdf_input: false, web_search: false, image_gen: false, reasoning: false },
			{ model: "gemini-2.0-flash-lite", image_input: false, pdf_input: false, web_search: false, image_gen: false, reasoning: false },
		],
	},
	// elevenlabs: {
	// 	provider: elevenlabs,
	// 	models: [
	// 		{ model: "scribe_v1", image_input: false, pdf_input: false, web_search: false, image_gen: false, reasoning: false },
	// 		{ model: "scribe_v1_experimental", image_input: false, pdf_input: false, web_search: false, image_gen: false, reasoning: false },
	// 	],
	// },
} as const;

export function getModelProvider(model: string) {
	for (const { provider, models } of Object.values(CHAT_MODELS)) {
		if (models.some(m => m.model === model)) {
			return provider;
		}
	}

	return undefined;
}

export function isModelValid(model: string) {
	for (const { models } of Object.values(CHAT_MODELS)) {
		if (models.some(m => m.model === model)) {
			return true;
		}
	}

	return false;
}

export function getModelNameById(model: string) {
	return model
		.split("-")
		.filter(part => isNaN(Number(part)))
		.map(part => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}