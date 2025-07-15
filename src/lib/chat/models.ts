import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
// import { elevenlabs } from "@ai-sdk/elevenlabs";

// Types & Interfaces
type ChatModelConfig = {
	model: string;
	name: string;
	webSearch: boolean;
};
type ChatModel = ChatModelConfig & {
	provider: any;
	tools?: Record<string, any>;
	settings?: Record<string, any>;
};



const OPENAI_AI_MODELS: ChatModelConfig[] = [
	{ model: "o4-mini", name: "o4-mini", webSearch: false },
	// { model: "o3", name: "o3", webSearch: false },
	{ model: "o3-mini", name: "o3-mini", webSearch: false },
	{ model: "gpt-4.1", name: "GPT-4.1", webSearch: true },
	{ model: "gpt-4.1-mini", name: "GPT-4.1 mini", webSearch: true },
	{ model: "gpt-4.1-nano", name: "GPT-4.1 nano", webSearch: false },
	{ model: "gpt-4o", name: "GPT-4o", webSearch: true },
	{ model: "gpt-4o-mini", name: "GPT-4o mini", webSearch: true },
];

const GOOGLE_AI_MODELS: ChatModelConfig[] = [
	{ model: "gemini-2.5-flash-preview-05-20", name: "Gemini 2.5 Flash", webSearch: true },
	{ model: "gemini-2.5-flash-lite-preview-06-17", name: "Gemini 2.5 Flash Lite", webSearch: true },
	{ model: "gemini-2.0-flash", name: "Gemini 2.0 Flash", webSearch: true },
	{ model: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", webSearch: false },
];

// const ELEVENLABS_AI_MODELS: ChatModelConfig[] = [
// 	{ model: "scribe_v1", name: "Scribe v1", webSearch: false },
// 	{ model: "scribe_v1_experimental", name: "Scribe v1 Experimental", webSearch: false },
// ];

export const CHAT_MODELS: Record<string, ChatModel[]> = {
	OpenAI: OPENAI_AI_MODELS.map(model => ({
		...model,
		provider: model.webSearch ? openai.responses : openai,
		tools: model.webSearch ? {
			webSearch_preview: openai.tools.webSearchPreview({ searchContextSize: "medium" }),
		} : undefined,
	})),
	Google: GOOGLE_AI_MODELS.map(model => ({
		...model,
		provider: google,
		settings: model.webSearch ? {
			useSearchGrounding: true,
		}: undefined,
	})),
} as const;

export function getChatModel(model: string): ChatModel | undefined {
	console.log(model);
	for (const models of Object.values(CHAT_MODELS)) {
		console.log(model);
		const match = models.find(m => m.model === model);
		if (match){
			// console.log(match);
			console.log("hit");
			return match;
		}
	}

	return undefined;
}
