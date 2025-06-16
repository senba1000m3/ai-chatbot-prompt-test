import { create } from "zustand";
import { nanoid } from "@/lib/utils";

// Types & Interfaces
import type { CoreMessage } from "ai";
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

	// Chat Options
	model: string;
	setModel: (model: string) => void;
	character: string;
	setCharacter: (character: string) => void;

	handleChatChange: (newChatId: string) => void;

	// Message related
	messages: Record<string, CoreMessage>;
	messageOrderArray: string[];
	appendMessage: (message: CoreMessage) => void;
	getMessageArray: () => CoreMessage[];
	clearMessages: () => void;
};



export const useChatStore = create<ChatStoreProps>(
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

		// Chat Options
		model: "gpt-4o",
		setModel: (model: string) => set({ model }),
		character: "tai-chan",
		setCharacter: (character: string) => set({ character }),

		handleChatChange: (newChatId: string) => {
			const {
				chatId,
				setChatId,
				clearMessages,
			} = get();

			if (newChatId === chatId) return;

			// Don't clear messages if route change started from `/chat`
			if (chatId) clearMessages();

			// Set new chatId, but let page handle chatTitle
			setChatId(newChatId);

			// TODO: Handle state reset
		},

		// Message related
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
		clearMessages: () => {
			set({ messages: {}, messageOrderArray: [] });
		},
	})
);