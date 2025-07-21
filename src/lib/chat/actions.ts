"use server";
import { createIdGenerator, streamText, generateObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import { openai } from "@ai-sdk/openai";
import { getChatModel } from "@/lib/chat/models";
import { ensureError } from "@/lib/response";
import { z } from "zod";

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
import type { CoreMessage } from "ai";
import type { StreamableValue } from "ai/rsc";
import { ChatOptions } from "@/types/chat";



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
			// temperature: 0.5,
			model: chatModel.provider(
				model,
				(useWebSearch && chatModel.webSearch) ? chatModel?.settings ?? {} : {}
			),
			system: `
			You are a helpful assistant currently in a chat with a user. Youhave the ability to answer questions and provide information based on the context provided by the user. The user may ask you to perform actions or provide information related to the conversation, and you can provide information based on the context provided by the user.\n\n
			Don't use tools if the question is not suitable or solvable by the provided tools.\n\n
			${characterPrompt
				? `Please answer the user's question in the requirements written in <character>:\n<character>\n${characterPrompt}\n</character>`
				: ""
			}\n\n
			You can also use tools written in <tools> to assist with tasks, but don't use them if the user's question is not suitable or solvable by the provided tools:\n
			${CHAT_TOOL_NAMES.length > 0
				? `<tools>\n${generateBlockToolPrompt(CHAT_TOOL_NAMES)}\n</tools>`
				: ""
			}
			`.trim(),
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
		console.error("ERR::CHAT::METADATA:", error.message);
		return { title: "My Smart Chat", tags: [] };
	}
}