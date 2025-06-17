"use client";
import { useCallback, useState } from "react";
import { useChatManager } from "@/hooks/use-chat-manager";
import { useChatStore } from "@/lib/store/chat";
import { useTranslations } from "next-intl";

// SWR
import { mutate } from "swr";

// Components & UI
import { Button } from "@/components/ui/button";
import { ChatModelSelect } from "./model-select";
import { ChatWebSearchToggle } from "./web-search-toggle";
import { SendButton } from "@/components/common/motion-buttons";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

// Icons & Images
// import { ArrowDown } from "lucide-react";

// Types & Interfaces
import type { CoreUserMessage } from "ai";



export function ChatInput() {
	const t = useTranslations("chat.input");

	const { handleSubmit } = useChatManager();
    const [isComposing, setIsComposing] = useState(false);

	// Chat related
	const input = useChatStore(state => state.input);
	const setInput = useChatStore(state => state.setInput);
	const isLoading = useChatStore(state => state.isLoading);
	// const hasScrolledToBottom = useChatStore(state => state.hasScrolledToBottom);

	// Combined states
	const disabled = !input.trim() || isComposing || isLoading;

	async function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (disabled) return;
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			await handleSubmit({
				createUserMessagesForAI,
				onNewChatCallback,
			});
		}
	}

	const createUserMessagesForAI = useCallback((input: string): CoreUserMessage[] => {
		return [{
			role: "user",
			content: [{ type: "text", text: input }],
		}];
	}, []);

	function onNewChatCallback() { mutate("/api/chats"); }

	return (
		<>
			{/* <Button
				size="icon"
				className="mx-auto disabled:opacity-0 rounded-full"
				disabled={hasScrolledToBottom}
			>
				<ArrowDown />
			</Button> */}
			<div className="space-y-2 p-2 border border-b-0 bg-background/40 rounded-t-md backdrop-blur-lg">
				<Textarea
					className="max-h-64 focus-visible:ring-0 bg-transparent! border-0 shadow-none resize-none"
					value={input}
					onCompositionStart={() => setIsComposing(true)}
					onCompositionEnd={() => setIsComposing(false)}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={t("placeholder")}
				/>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<ChatModelSelect />
						<ChatWebSearchToggle />
					</div>
					<Tooltip>
						<TooltipTrigger asChild>
							<div>
								<Button
									className="disabled:cursor-not-allowed"
									size="icon"
									onClick={async () => {
										if (disabled) return;
										await handleSubmit({
											createUserMessagesForAI,
											onNewChatCallback,
										});
									}}
									disabled={disabled}
									asChild
								>
									<SendButton />
								</Button>
							</div>
						</TooltipTrigger>
						<TooltipContent collisionPadding={16}>
							{disabled ? t("disabled") : t("enabled")}
						</TooltipContent>
					</Tooltip>
				</div>
			</div>
		</>
	);
}