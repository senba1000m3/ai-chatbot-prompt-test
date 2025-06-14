"use server";
import { createIdGenerator, streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { getModelProvider } from "@/lib/chat/models";

// Auth
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Database
import { db } from "@/lib/db/drizzle";
import { messages as DrizzleMessages } from "@/lib/db/schema";

// Constants & Variables
import { CHAT_TOOLS, CHAT_TOOL_CONFIGS, CHAT_TOOL_NAMES } from "./tools";

// Types & Interfaces
import type { StreamableValue } from "ai/rsc";
import type { ChatOptions } from "@/types/chat";



// https://ai-sdk.dev/cookbook/rsc/stream-text
export async function generate({
	chatId,
	messages = [],
	model,
	character,
}: ChatOptions): Promise<StreamableValue> {
	// TODO: Auth & Rate Limit

	const stream = createStreamableValue();
	const provider = getModelProvider(model);
	if (!provider) throw new Error(`Model provider not found for model: ${model}`);

	(async () => {
		const result = streamText({
			model: provider(model),
			system: `
				You are a helpful assistant that can answer questions and provide information based on the context provided by the user. You can also use tools to assist with tasks. The user may ask you to perform actions or provide information related to the conversation.\n
				You are currently in a chat with a user. The user may ask you to perform actions or provide information related to the conversation. You can use tools to assist with tasks, and you can also provide information based on the context provided by the user.\n\n
				Don't use tools if the question is not solvable by the provided tools.
				Please separate paragraphs with the \`\\n\\n---\\n\\n\` string.

				${CHAT_TOOL_NAMES.length > 0 ? generateBlockToolPrompt(CHAT_TOOL_NAMES) : ""}
			`,
			messages,
			tools: CHAT_TOOLS,
			experimental_generateMessageId: createIdGenerator({ size: 16 }),
			async onFinish({ finishReason, usage, toolCalls, toolResults, response }) {
				const session = await auth.api.getSession({ headers: await headers() });

				const userId = session?.user?.id;
				const model = response.modelId;
				const message = response.messages[0];  // TODO: Handle multiple messages
				const createdAt = response.timestamp;
				const updatedAt = response.timestamp;

				const msg = {
					id: message.id,
					role: message.role,
					content: message.content,
					chatId,
					userId,
					metadata: {
						model,
						usage,
					},
					createdAt,
					updatedAt,
				};
				console.log(`Message finished, reason: ${finishReason}.`);
				await db.insert(DrizzleMessages).values(msg).onConflictDoNothing();
			},
			onError({ error }) {
				console.error(`ERR::STREAM::TX: ${error}`);
			},
			maxSteps: 10,
		});

		result.consumeStream();

		try {
			for await (const part of result.fullStream) {
				stream.update(part);
			}
		} catch (error: any) {
			console.error("Error in streaming:", error);
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