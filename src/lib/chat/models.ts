import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
// import { elevenlabs } from "@ai-sdk/elevenlabs";



export const CHAT_MODELS = {
	OpenAI: {
		provider: openai,
		models: [
			{
				model: "o4-mini",
				name: "o4 Mini",
			},
			{
				model: "o3",
				name: "o3",
			},
			{
				model: "o3-mini",
				name: "o3 Mini",
			},
			{
				model: "gpt-4.1",
				name: "GPT-4.1",
			},
			{
				model: "gpt-4.1-mini",
				name: "GPT-4.1 mini",
			},
			{
				model: "gpt-4.1-nano",
				name: "GPT-4.1 nano",
			},
			{
				model: "gpt-4o",
				name: "GPT-4o",
			},
			{
				model: "gpt-4o-mini",
				name: "GPT-4o mini",
			},
		],
	},
	Google: {
		provider: google,
		models: [
			{
				model: "gemini-2.5-flash-preview-05-20",
				name: "Gemini 2.5 Flash",
			},
			{
				model: "gemini-2.0-pro-exp-02-05",
				name: "Gemini 2.0 Pro",
			},
			{
				model: "gemini-2.0-flash",
				name: "Gemini 2.0 Flash",
			},
			{
				model: "gemini-2.0-flash-lite",
				name: "Gemini 2.0 Flash Lite",
			},
		],
	},
	// ElevenLabs: {
	// 	provider: elevenlabs,
	// 	models: [
	// 		{
	// 			model: "scribe_v1",
	// 			name: "Scribe v1",
	// 		},
	// 		{
	// 			model: "scribe_v1_experimental",
	// 			name: "Scribe v1 Experimental",
	// 		},
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

export function getModelNameById(model: string) {
	for (const { models } of Object.values(CHAT_MODELS)) {
		const match = models.find(m => m.model === model);
		if (match) return match.name;
	}

	return undefined;
}