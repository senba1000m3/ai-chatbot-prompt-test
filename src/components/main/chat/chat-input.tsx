"use client";
import { useRouter } from "@/lib/i18n/navigation";
import { useChatManager } from "@/hooks/use-chat-manager";
import { useChatStore } from "@/lib/store/chat";
import { useTranslations } from "next-intl";
import { nanoid } from "@/lib/utils";

// Database
import fetcher from "@/lib/fetcher";

// Components & UI
import { ChatModelSelect } from "./model-select";
import { Textarea } from "@/components/ui/textarea";

// Types & Interfaces
import type { CoreUserMessage } from "ai";



export function ChatInput() {
	const t = useTranslations("chat.input");
	const { sendMessage } = useChatManager();

	const router = useRouter();

	// Chat related
	const chatId = useChatStore(state => state.chatId);
	const input = useChatStore(state => state.input);
	const setInput = useChatStore(state => state.setInput);
	const model = useChatStore(state => state.model);

	// Message related
	const appendMessage = useChatStore(state => state.appendMessage);

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	}

	async function handleSubmit() {
		if (!input.trim()) return;
		const message: CoreUserMessage = {
			role: "user",
			content: [{ type: "text", text: input }],
		};

		let targetChatId = chatId;
		if (!targetChatId) {
			targetChatId = nanoid();

			await fetcher("/api/chats", {
				method: "POST",
				data: { id: targetChatId },
			});

			router.push(`/chat/${targetChatId}`);
			// ! Append message after route push
			// ! Since route change clears messages
		}

		appendMessage(message);
		await sendMessage({
			chatId: targetChatId,
			messages: [message],
			model,
			character: "default",
		});
		setInput("");
	}

	return (
		<div className="space-y-2 p-2 border border-b-0 bg-background/40 rounded-t-md backdrop-blur-lg">
			<Textarea
				className="max-h-64 focus-visible:ring-0 bg-transparent! border-0 shadow-none resize-none"
				value={input}
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={t("placeholder")}
			/>
			<div>
				<ChatModelSelect />
			</div>
		</div>
	);
}