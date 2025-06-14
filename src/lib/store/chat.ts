import { create } from "zustand";
import { nanoid } from "@/lib/utils";

// Types & Interfaces
import { CoreMessage } from "ai";
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
	model: string;
	setModel: (model: string) => void;

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
		model: "gemini-2.5-flash-preview-05-20",
		setModel: (model: string) => set({ model }),

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
			console.log("Appended message:", message);
		},
		getMessageArray: () => {
			const { messages, messageOrderArray } = get();
			return messageOrderArray.map(id => messages[id]);
		},
		clearMessages: () => {
			set({ messages: {}, messageOrderArray: [] });
			console.log("Cleared messages");
		},
	})
);