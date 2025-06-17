"use server";
import { createIdGenerator, streamText, generateObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import { getChatModel } from "@/lib/chat/models";
import { ensureError } from "@/lib/response";

// Auth
import { userAuthorization } from "@/lib/auth/utils";

// Database
import { db } from "@/lib/db/drizzle";
import { messages as DrizzleMessages } from "@/lib/db/schema";
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();

// Constants & Variables
import { CHAT_TOOLS, CHAT_TOOL_CONFIGS, CHAT_TOOL_NAMES } from "./tools";

// Types & Interfaces
import type { StreamableValue } from "ai/rsc";
import type { ChatOptions } from "@/types/chat";

// Zod
import { z } from 'zod';

// https://ai-sdk.dev/cookbook/rsc/stream-text
export async function generate({
	chatId,
	messages = [],
	model,
	character,
	useWebSearch,
}: ChatOptions): Promise<StreamableValue> {
	// TODO: Rate Limit
	const user = await userAuthorization();

	const stream = createStreamableValue();
	const chatModel = getChatModel(model);
	if (!chatModel) throw new Error(`Model not available: ${model}`);

	(async () => {
		const characterPrompt = await redis.get(character);

		const result = streamText({
			model: chatModel.provider(
				model,
				(useWebSearch && chatModel.webSearch) ? chatModel?.settings ?? {} : {}
			),
			system: `
				You are a helpful assistant that can answer questions and provide information based on the context provided by the user. You can also use tools to assist with tasks. The user may ask you to perform actions or provide information related to the conversation.\n
				You are currently in a chat with a user. The user may ask you to perform actions or provide information related to the conversation. You can use tools to assist with tasks, and you can also provide information based on the context provided by the user.\n\n
				Don't use tools if the question is not solvable by the provided tools.\n\n
				${characterPrompt
					? `Please answer the user's question in the below character\n<character>\n${characterPrompt}\n</character>`
					: ""
				}\n\n
				${CHAT_TOOL_NAMES.length > 0 ? generateBlockToolPrompt(CHAT_TOOL_NAMES) : ""}
			`,
			messages,
			tools: {
				...CHAT_TOOLS,
				...((useWebSearch && chatModel.webSearch) ? chatModel?.tools ?? {} : {}),
			},
			experimental_generateMessageId: createIdGenerator({ size: 16 }),
			async onFinish({ finishReason, response, usage }) {
				console.log("STREAM::TX::FIN:", finishReason);

				const baseTimestamp = new Date(response.timestamp).getTime();
				const dbMessages = response.messages.map((message, index) => {
					const timestamp = new Date(baseTimestamp + index);

					return {
						id: message.id,
						role: message.role,
						content: message.content,
						chatId,
						userId: user.id,
						metadata: {
							model: response.modelId,
							usage,
						},
						createdAt: timestamp,
						updatedAt: timestamp,
					}
				});
				await db.insert(DrizzleMessages).values(dbMessages).onConflictDoNothing();
			},
			onError({ error: err }) {
				const error = ensureError(err);
				console.error("ERR::STREAM::TX:", error.message);
			},
			maxSteps: 10,
		});

		result.consumeStream();

		try {
			for await (const part of result.fullStream) {
				stream.update(part);
			}
		} catch (err) {
			const error = ensureError(err);
			console.error("ERR::STREAM:", error.message);
		}

		stream.done();
	})();

	return stream.value;
}

function generateBlockToolPrompt(chatToolNames: string[]): string {
	return `
	Blocks is a special user interface mode that helps users with solving problem. When block is open, it is on the right side of the screen, while the conversation is on the left side. When using ${chatToolNames.join(", ")} are reflected in real-time on the blocks and visible to the user.\n\n
	${chatToolNames.map(toolName => CHAT_TOOL_CONFIGS[toolName]?.guidePrompt || "").join("\n")}
	`;
}

export async function generateChatMeta(messages: ChatOptions["messages"]): Promise<{ title: string; tags: string[] }> {

	if (messages.length === 0) return { title: "Untitled Chat", tags: [] };
	const user = await userAuthorization();
	const chatModel = getChatModel("gpt-4.1-mini");

	try {
		const { object } = await generateObject({
			model: chatModel.provider(chatModel.model),
			schema: z.object({
				title: z.string().describe("The title of the chat"),
				tags: z.array(z.string()).describe("Tags related to the chat"),
			}),
			prompt: `You are a helpful assistant that can generate a title and tags for a chat based on the messages provided. The title should be concise and reflect the main topic of the conversation.
		${messages.map(m => {
				const messageText = m.content
					.filter(c => c.type === 'text')
					.map(c => c.text)
					.join(" ");
				return `\n- ${m.role}: ${messageText}`;
			}).join('')}`,
		});
		if (object?.title) {
			return object;
		}
		return { title: "My Smart Chat", tags: [] };
	} catch (err) {
		const error = ensureError(err);
		console.error("ERR::CHAT::META:", error.message);
		return { title: "ERROR TITLE", tags: [] };
	}
}