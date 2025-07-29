import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { availableModels } from "@/lib/store/prompt";

// Types & Interfaces
type ChatModelConfig = {
	id: string;
	model: string;
	name: string;
	webSearch: boolean;
	isThinking?: boolean;
};
type ChatModel = ChatModelConfig & {
	provider: any;
	tools?: Record<string, any>;
	settings?: Record<string, any>;
};

// 取得 OpenAI 與 Google 的模型清單，並根據 availableModels 的 webSearch 屬性設置
const OPENAI_AI_MODELS = availableModels.filter(m => m.category === "OpenAI").map(m => ({
	id: m.id,
	model: m.id.replace(/-thinking$/, ""), // model 屬性去掉 -thinking
	name: m.name,
	webSearch: m.webSearch,
	isThinking: m.isThinking,
}));

const GOOGLE_AI_MODELS = availableModels.filter(m => m.category === "Google").map(m => ({
	id: m.id,
	model: m.id.replace(/-thinking$/, ""),
	name: m.name,
	webSearch: m.webSearch,
	isThinking: m.isThinking,
}));

export const CHAT_MODELS: Record<string, ChatModel[]> = {
	OpenAI: OPENAI_AI_MODELS.map(model => ({
		...model,
		provider: model.webSearch ? openai.responses : openai,
		isThinking: model.isThinking, // 確保 isThinking 正確帶入
		tools: model.webSearch ? {
			webSearch_preview: openai.tools.webSearchPreview({ searchContextSize: "medium" }),
		} : undefined,
	})),
	Google: GOOGLE_AI_MODELS.map(model => ({
		...model,
		provider: google,
		isThinking: model.isThinking, // 確保 isThinking 正確帶入
		settings: model.webSearch ? {
			useSearchGrounding: true,
		}: undefined,
	})),
} as const;

export function getChatModel(model: string): ChatModel | undefined {
	// 直接用 id 精確比對
	for (const models of Object.values(CHAT_MODELS)) {
		const match = models.find(m => m.id === model);
		if (match){
			return match;
		}
	}
	return undefined;
}
