"use server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { getChatModel } from "./models";
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();

// Types & Interfaces
import type { CoreMessage } from "ai";

import { type ParametersType } from "@/lib/store/prompt";

const REASONING_OPTIONS = {
	openai: {
		reasoningEffort: "low",
	} as any,
	google: {
		thinkingConfig: {
			includeThoughts: true,
		},
	} as any,
};

export async function generate({ modelName, messages = [], systemPrompt, parameters }: { modelName: string, messages: CoreMessage[], systemPrompt? : string, parameters: ParametersType }) {
	const chatModel = getChatModel(modelName);

	if (!chatModel) {
		const errorMessage = `Model not found: ${modelName}`;
		return;
	}

	const startTime = Date.now();
	// console.log(messages);

	const processedMessages: CoreMessage[] = [];
	messages.forEach(msg => {
		if (msg.role === "user") {
			if (Array.isArray(msg.content)) {
				const contentParts = msg.content.filter(c => {
					if (c.type === "text" && c.text.trim() !== "") return true;
					if (c.type === "image" && (c as any).image) return true;
					return false;
				}) as ({ type: "text"; text: string } | { type: "image"; image: string | URL | Buffer | Uint8Array })[];

				if (contentParts.length > 0) {
					processedMessages.push({ ...msg, content: contentParts });
				}
			} else if (typeof msg.content === "string" && msg.content.trim() !== "") {
				processedMessages.push(msg);
			}
		}
		else if (msg.role === "assistant") {
			if (Array.isArray(msg.content)) {
				const contentParts = msg.content.filter(c => c.type === "text" && c.text.trim() !== "");
				if (contentParts.length > 0) {
					processedMessages.push({ ...msg, content: contentParts });
				}
			} else if (typeof msg.content === "string" && msg.content.trim() !== "") {
				processedMessages.push(msg);
			}
		}
	});

	const messagesWithSystem = systemPrompt
		? [{ role: "system", content: systemPrompt }, ...processedMessages]
		: processedMessages;

	const providerOptions = {
		...(chatModel.isThinking ? REASONING_OPTIONS[chatModel.provider === openai ? "openai" : "google"] : {}),
		...(typeof parameters.temperature === "number" ? { temperature: parameters.temperature } : {}),
	};

	console.log(chatModel.name, providerOptions);

	const genTextParams: any = {
		model: chatModel.provider(chatModel.model),
		messages: messagesWithSystem as CoreMessage[],
		providerOptions,
	};

	const { text } = await generateText(genTextParams);

	const endTime = Date.now();
	const spendTime = endTime - startTime;

	return { text, spendTime };
}


