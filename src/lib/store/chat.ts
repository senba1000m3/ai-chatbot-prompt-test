import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "@/lib/utils";

// Types & Interfaces
import type { CoreMessage } from "ai";
import type { SourcePart } from "@/types/chat";
interface ChatStoreProps {
	// Chat related
	chatId: string;
	setChatId: (chatId: string) => void;
	chatTitle: string;
	setChatTitle: (chatTitle: string) => void;
	input: string;
	setInput: (input: string) => void;
	isLoading: boolean;
	setIsLoading: (isLoading: boolean) => void;
	hasScrolledToBottom: boolean;
	setHasScrolledToBottom: (hasScrolled: boolean) => void;

	// Chat Options
	model: string;
	setModel: (model: string) => void;
	character: string;
	setCharacter: (character: string) => void;
	useWebSearch: boolean;
	setUseWebSearch: (webSearch: boolean) => void;

	handleChatChange: (newChatId: string) => void;

	// Message related
	sources: Record<string, SourcePart["source"][]>;
	appendSource: (source: SourcePart) => void;
	messages: Record<string, CoreMessage>;
	messageOrderArray: string[];
	appendMessage: (message: CoreMessage) => void;
	getMessageArray: () => CoreMessage[];
	messageExists: (id: string) => boolean;
	clearMessages: () => void;
};



export const useChatStore = create<ChatStoreProps>()(
	persist(
		(set, get) => ({
			// Chat related
			chatId: "",
			setChatId: (chatId: string) => set({ chatId }),
			chatTitle: "",
			setChatTitle: (chatTitle: string) => set({ chatTitle }),
			input: "",
			setInput: (input: string) => set({ input }),
			isLoading: false,
			setIsLoading: (isLoading: boolean) => set({ isLoading }),
			hasScrolledToBottom: true,
			setHasScrolledToBottom: (hasScrolledToBottom: boolean) => set({ hasScrolledToBottom }),

			// Chat Options
			model: "gpt-4o",
			setModel: (model: string) => set({ model }),
			character: "tai-chan",
			setCharacter: (character: string) => set({ character }),
			useWebSearch: true,
			setUseWebSearch: (useWebSearch: boolean) => set({ useWebSearch }),

			handleChatChange: (newChatId: string) => {
				const {
					chatId,
					setChatId,
					setChatTitle,
					setIsLoading,
					clearMessages,
				} = get();

				if (newChatId === chatId) return;

				if (!newChatId) setChatTitle("");

				// Don't clear messages if route change started from `/chat`
				if (chatId) clearMessages();

				// Set new chatId, but let page handle chatTitle
				setChatId(newChatId);

				// TODO: Handle state reset
				if (!(!chatId && newChatId)) setIsLoading(false);
			},

			// Message related
			sources: {},
			appendSource: (source: SourcePart) => {
				set(state => {
					const { messages, messageOrderArray, sources } = state;
					const lastMessageId = messageOrderArray[messageOrderArray.length - 1];
					const lastMessage = messages[lastMessageId];

					if (!lastMessageId || lastMessage.role !== "assistant") return state;

					return {
						sources: {
							...sources,
							[lastMessageId]: [...(sources[lastMessageId] ?? []), source.source],
						},
					};
				});
			},
			// ? This is why we don't use useChat()
			// ? Time complexity is O(1) instead of O(n)
			messages: {} as Record<string, CoreMessage>,
			messageOrderArray: [],
			appendMessage: (message: CoreMessage) => {
				set(state => {
					const { messages, messageOrderArray } = state;

					// Update the previous message if both are from the assistant
					// b/c the new one is just the old one but with more chunks
					if (message.role === "assistant") {
						const lastMessageId = messageOrderArray[messageOrderArray.length - 1];
						const lastMessage = messages[lastMessageId];

						if (lastMessage && lastMessage.role === "assistant") {
							return {
								messages: {
									...messages,
									[lastMessageId]: message,
								},
							};
						}
					}

					// Create a new message if it's not
					const id = nanoid();
					return {
						messages: {
							...messages,
							[id]: message,
						},
						messageOrderArray: [...messageOrderArray, id],
					};
				});
			},
			getMessageArray: () => {
				const { messages, messageOrderArray } = get();
				return messageOrderArray.map(id => messages[id]);
			},
			messageExists: (id: string) => {
				const { messageOrderArray } = get();
				return messageOrderArray.includes(id);
			},
			clearMessages: () => {
				set({ messages: {}, messageOrderArray: [] });
			},
		}),
		{
			name: "tau-chat",
			partialize: state => ({
				model: state.model,
				character: state.character,
				useWebSearch: state.useWebSearch,
			}),
		}
	)
);