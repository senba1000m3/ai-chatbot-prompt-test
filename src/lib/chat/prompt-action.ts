"use server";
import { streamText, generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { getChatModel } from "./models";
import { ensureError } from "@/lib/response";
import { createStreamableValue } from "ai/rsc";

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
import { ChatOptions } from "@/types/chat";

export async function generate({ modelId: modelName, messages }: { modelId: string, messages: CoreMessage[] }) {
    console.log(`[Action] Generating chat for model: ${modelName}`);
    console.log(`[Action] Messages:`, JSON.stringify(messages, null, 2));

    const stream = createStreamableValue();

    (async () => {
        const startTime = Date.now();
        try {
            const chatModel = getChatModel(modelName);

            if (!chatModel) {
                throw new Error(`Model not found in prompt-action: ${modelName}`);
            }

            console.log(`[Action] Got chat model for: ${modelName}`);
            const { textStream } = await streamText({
                model: chatModel,
                messages,
            });

            for await (const delta of textStream) {
                stream.update(delta);
            }

            const endTime = Date.now();
            const spendTime = endTime - startTime;

            // After the stream is done, update with the final metadata including spendTime.
            stream.done({ spendTime });

        } catch (err) {
            const error = ensureError(err);
            console.error(`ERR::CHAT::GENERATE::${modelName}:`, error.message);
            stream.update(`Error: ${error.message}`);
            stream.done({ error: error.message });
        }
    })();

    return {
        textStream: stream.value,
    };
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

