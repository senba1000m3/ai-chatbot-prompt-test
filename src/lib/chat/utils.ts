import { useChatStore } from "@/lib/store/chat";
import { useToolStore } from "@/lib/store/tool";
import { readStreamableValue } from "ai/rsc";
import { match } from "ts-pattern";

// Constants & Variables
import { CHAT_TOOL_CONFIGS } from "./tools";
const THROTTLE_INTERVAL = 80;  // ms

// Types & Interfaces
import type {
	CoreMessage,
	CoreAssistantMessage,
	CoreToolMessage,
	ObjectStreamPart,
	TextPart,
	TextStreamPart,
	ToolCallPart,
	ToolResultPart,
} from "ai";
import type { StreamableValue } from "ai/rsc";
import type { SourcePart } from "@/types/chat";



// # Streamable
export async function receiveStream(
	streamValue: StreamableValue,
	executeTool: any
) {
	const appendSource = useChatStore.getState().appendSource;
	const appendMessage = useChatStore.getState().appendMessage;
	const throttledAppendMessage = throttleBuffer((calls: CoreMessage[][]) => {
		for (const [message] of calls) {
			appendMessage(message);
		}
	}, THROTTLE_INTERVAL);

	let messageContent: Array<TextPart | ToolCallPart> = [];

	(async () => {
		try {
			for await (const part of readStreamableValue<TextStreamPart<any>>(streamValue)) {
				if (!part) continue;

				// About chunk (part) types:
				// https://ai-sdk.dev/docs/ai-sdk-core/generating-text#onchunk-callback
				// https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text#full-stream
				match(part)
					.with({ type: "text-delta" }, (part) => {
						// console.log("STREAM::RX::TEXT_DELTA");
						// If the last part is a TextPart, append textDelta to it
						// Otherwise, create a new TextPart
						const prevPart = messageContent[messageContent.length - 1];
						if (prevPart && prevPart.type === "text") {
							prevPart.text += part.textDelta;
						} else {
							messageContent.push({
								type: "text",
								text: part.textDelta,
							} satisfies TextPart);
						}

						throttledAppendMessage({
							role: "assistant",
							content: messageContent,
						} satisfies CoreAssistantMessage);
					})
					.with({ type: "reasoning" }, () => { console.log("STREAM::RX::REASONING: Skipped") })
					.with({ type: "reasoning-signature" }, () => { console.log("STREAM::RX::REASONING: Skipped") })
					.with({ type: "redacted-reasoning" }, () => { console.log("STREAM::RX::REASONING: Skipped") })
					.with({ type: "source" }, (part) => {
						console.log("STREAM::RX::SOURCE");
						const source = part.source;
						const cleanUrl = new URL(source.url);
						cleanUrl.searchParams.delete("utm_source");
						const sourcePart: SourcePart = {
							type: "source",
							source: {
								id: source.id,
								url: cleanUrl.toString(),
								title: source.title,
							},
						};
						appendSource(sourcePart);
					})
					.with({ type: "file" }, () => { console.log("STREAM::RX::FILE: Skipped") })
					.with({ type: "tool-call" }, (part) => {
						console.log("STREAM::RX::TOOL_CALL");
						const { type, toolCallId, toolName, args } = part;
						const toolCallPart: ToolCallPart = {
							type,
							toolCallId,
							toolName,
							args,
						};

						messageContent.push(toolCallPart);
						throttledAppendMessage({
							role: "assistant",
							content: messageContent,
						} satisfies CoreAssistantMessage);

						// And ofc we execute the tool call
						executeTool(toolCallId, toolName, args);
					})
					.with({ type: "tool-call-streaming-start" }, () => { })  // when `toolCallStreaming` is enabled
					.with({ type: "tool-call-delta" }, () => { })  // when `toolCallStreaming` is enabled
					.with({ type: "tool-result" }, (part) => {
						console.log("STREAM::RX::TOOL_RESULT");
						messageContent = [];  // Resets content array since it's a new CoreToolMessage

						const { type, toolCallId, toolName, result } = part;
						const toolResultPart: ToolResultPart = {
							type,
							toolCallId,
							toolName,
							result,
							isError: false,
						};

						throttledAppendMessage({
							role: "tool",
							content: [toolResultPart],
						} satisfies CoreToolMessage);
					})
					.with({ type: "step-start" }, () => { console.log("STREAM::RX::STEP_START") })
					.with({ type: "step-finish" }, () => { console.log("STREAM::RX::STEP_FINISH") })
					.with({ type: "finish" }, () => {
						throttledAppendMessage.flush();
						console.log("STREAM::RX::FINISH");
					})
					.with({ type: "error" }, () => { console.error("ERR::STREAM::RX::Part:", part) })
					.exhaustive();
			}

			const setIsLoading = useChatStore.getState().setIsLoading;
			setIsLoading(false);
		} catch (error: any) {
			console.error("ERR::STREAM::RX:", error);
		}
	})();
}

export async function receiveObjectStream(
	streamValue: StreamableValue,
	toolCallId: string,
	toolName: string,
) {
	const appendToolResult = useToolStore.getState().appendToolResult;
	const throttledAppendToolResult = throttleBuffer((calls: any[][]) => {  // TODO: Fix type
		for (const [toolCallId, result] of calls) {
			appendToolResult(toolCallId, result);
		}
	}, THROTTLE_INTERVAL);

	const { schema } = CHAT_TOOL_CONFIGS[toolName];

	(async () => {
		try {
			for await (const delta of readStreamableValue<ObjectStreamPart<any>>(streamValue)) {
				const result = schema.parse(delta || {});
				throttledAppendToolResult(toolCallId, result);
			}

			throttledAppendToolResult.flush();
		} catch (error: any) {
			console.error("ERR::STREAM_OBJ::RX:", error);
		}
	})();
}

function throttleBuffer<T extends (...args: any[]) => void>(
	handler: (bufferedCalls: Parameters<T>[]) => void,
	interval: number,
) {
	let lastFlush = 0;
	let buffer: Parameters<T>[] = [];

	function flush() {
		if (buffer.length > 0) {
			handler(buffer);
			buffer = [];
		}
	}

	function throttledFn(...args: Parameters<T>) {
		buffer.push(args);

		const now = Date.now();
		if (now - lastFlush >= interval) {
			lastFlush = now;
			flush();
		}
	}

	throttledFn.flush = flush;
	return throttledFn;
}