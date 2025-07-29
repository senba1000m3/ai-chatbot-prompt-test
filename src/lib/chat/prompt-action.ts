"use server";
import { generateText, generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { createStreamableValue } from "ai/rsc";
import { getChatModel } from "./models";
import { ensureError } from "@/lib/response";

// Auth
import { userAuthorization } from "@/lib/auth/utils";

// Database
import { db } from "@/lib/db/drizzle";
import { messages as DrizzleMessages } from "@/lib/db/schema";
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();

// Types & Interfaces
import type { CoreMessage } from "ai";
import type { StreamableValue } from "ai/rsc";

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
		console.log("no")
		return;
	}

	console.log(chatModel.model);

	const startTime = Date.now();

	const messagesWithSystem = systemPrompt
		? [{ role: "system", content: systemPrompt }, ...messages]
		: messages;

	const providerOptions = {
		...(chatModel.isThinking ? REASONING_OPTIONS[chatModel.provider === openai ? "openai" : "google"] : {}),
		...(typeof parameters.temperature === "number" ? { temperature: parameters.temperature } : {}),
	};

	console.log(chatModel.name, providerOptions);

	const { text } = await generateText({
		model: chatModel.provider(chatModel.model),
		messages: messagesWithSystem as CoreMessage[],
		providerOptions,
	});

	const endTime = Date.now();
	const spendTime = endTime - startTime;

	return { text, spendTime };
}

