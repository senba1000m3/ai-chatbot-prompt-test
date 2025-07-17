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

export async function generate({ modelName, messages = [], systemPrompt }: { modelName: string, messages: CoreMessage[], systemPrompt? : string }) {
	const chatModel = getChatModel(modelName);

	if (!chatModel) {
		const errorMessage = `Model not found: ${modelName}`;
		return;
	}
	else{
		console.log(chatModel);
	}

	const startTime = Date.now();

	const messagesWithSystem = systemPrompt
		? [{ role: "system", content: systemPrompt }, ...messages]
		: messages;

	const { text } = await generateText({
		model: chatModel.provider(chatModel.model),
		messages: messagesWithSystem,
	});

	const endTime = Date.now();
	const spendTime = endTime - startTime;

	return { text, spendTime };
}

