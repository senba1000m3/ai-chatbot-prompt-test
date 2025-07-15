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

export async function generate({ modelName, messages = [] }: { modelName: string, messages: CoreMessage[] }) {

	const chatModel = getChatModel(modelName);
	console.log("Selected model:", modelName, chatModel);
	if (!chatModel) {
		const errorMessage = `Model not found: ${modelName}`;
		return;
	}
	else{
		console.log(chatModel);
	}

	// 开始计时 - 直接测量 AI 请求/响应时间
	const startTime = Date.now();

	const { text } = await generateText({
		model: chatModel.provider(chatModel.model),
		messages,
		// ...(chatModel.tools && { tools: chatModel.tools }),
		// ...(chatModel.settings && { settings: chatModel.settings }),
	});

	const endTime = Date.now();
	const spendTime = endTime - startTime;

	return { text, spendTime };
}

export async function generateChatMetadata({ messages }: {
	messages: CoreMessage[];
}): Promise<{ title: string; tags: string[] }> {
	if (messages.length === 0) return { title: "Untitled Chat", tags: [] };

	try {
		const { object } = await generateObject({
			model: openai("gpt-4.1-mini"),
			schema: z.object({
				title: z.string().describe("The title of the chat."),
				tags: z.array(z.string()).describe("Tags related to the chat."),
			}),
			prompt: `
			You are a helpful assistant that can generate a title and tags for a chat based on the messages provided. The title should be concise and reflect the main topic of the conversation.\n\n
			${messages.map(message => {
				let content = "";
				if (typeof message.content === "string") {
					content = message.content;
				} else {
					content = message.content
						.filter(c => c.type === "text")
						.map(c => c.text).join(" ");
				}

				return `- ${message.role}: ${content}`;
			}).join("\n")}
			`,
		});

		if (object?.title) return object;
		return { title: "My Smart Chat", tags: [] };
	} catch (err) {
		const error = ensureError(err);
		return { title: "My Smart Chat", tags: [] };
	}
}

