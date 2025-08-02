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

	const processedMessages: CoreMessage[] = [];
	let images: string[] = [];
	messages.forEach(msg => {
		if ((msg.role === "user" || msg.role === "assistant")) {
			if (Array.isArray(msg.content)) {
				const textParts = msg.content.filter(c => c.type === "text").map(c => c.text).join("\n");
				const imageParts = msg.content
					.filter((c): c is { type: "image"; image: string } => c.type === "image" && typeof (c as any).image === "string")
					.map(c => c.image);
				if (textParts) {
					processedMessages.push({ ...msg, content: textParts });
				}
				if (imageParts.length > 0 && msg.role === "user") {
					images = images.concat(imageParts);
				}
			} else if (typeof msg.content === "string") {
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
	if (images.length > 0) {
		genTextParams.images = images;
	}

	const { text } = await generateText(genTextParams);

	const endTime = Date.now();
	const spendTime = endTime - startTime;

	return { text, spendTime };
}