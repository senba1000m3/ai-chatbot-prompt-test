import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "@/lib/utils";
import type { ModelResponse } from "@/types/chat";

// Types & Interfaces
import type { CoreMessage } from "ai";
import type { SourcePart } from "@/types/chat";

export interface ModelMessage extends CoreMessage {
	spendTime?: number;
}

interface PromptStoreProps {
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

	// Prompt Used
	systemPrompt: Record<string, string>;
	setSystemPrompt: (systemPrompt: Record<string, string>) => void;
	isSystemPromptOn: Record<string, boolean>;
	setIsSystemPromptOn: (key: string, value: boolean) => void;

	userPrompt: string[];
	setUserPrompt: (userPrompt: string[]) => void;

	totalPrompts: string;
	setTotalPrompts: (totalPrompts: string) => void;

	inputMessage: string;
	setInputMessage: (value: string) => void;
	multiSendTimes: number;
	setMultiSendTimes: (times: number) => void;

	selectedModels: string[];
	setSelectedModels: (models: string[]) => void;
	selectedTools: string[];
	setSelectedTools: (tools: string[]) => void;

	modelMessages: Record<string, Record<string, ModelMessage>>;
	modelMessageOrder: Record<string, string[]>;
	appendModelMessage: (modelId: string, message: ModelMessage) => string;
	updateModelMessage: (modelId: string, messageId: string, update: Partial<ModelMessage>) => void;
	getModelMessages: (modelId: string) => ModelMessage[];
	clearModelMessages: (modelId: string) => void;
	// 新增每個模型的加載狀態
	modelIsLoading: Record<string, boolean>;
	setModelIsLoading: (modelId: string, isLoading: boolean) => void;
};

export const usePromptStore = create<PromptStoreProps>()(
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

			systemPrompt: {} as Record<string, string>,
			setSystemPrompt: (systemPrompt: Record<string, string>) => set({ systemPrompt }),
			isSystemPromptOn: {},
			setIsSystemPromptOn: (key: string, value: boolean) => {
				set(state => {
					const newIsSystemPromptOn = { ...state.isSystemPromptOn };
					newIsSystemPromptOn[key] = value;
					return { isSystemPromptOn: newIsSystemPromptOn };
				});
			},
			userPrompt: [],
			setUserPrompt: (userPrompt: string[]) => set({ userPrompt }),
			totalPrompts: "",
			setTotalPrompts: (totalPrompts: string) => {
				const { systemPrompt, isSystemPromptOn } = get();
				let currentPrompts = "";
				Object.entries(systemPrompt).forEach(([key, prompt]) => {
					if (isSystemPromptOn[key]) {
						currentPrompts += prompt + "\n";
					}
				});
				set({ totalPrompts: currentPrompts.trim() });
			},

			inputMessage: "",
			setInputMessage: (value: string) => set({ inputMessage: value }),
			multiSendTimes: 1,
			setMultiSendTimes: (times: number) => set({ multiSendTimes: times }),

			selectedModels: [],
			setSelectedModels: (models: string[]) => set({ selectedModels: models }),
			selectedTools: [],
			setSelectedTools: (tools: string[]) => set({ selectedTools: tools }),
			modelMessages: {},
			modelMessageOrder: {},
			appendModelMessage: (modelId: string, message: ModelMessage) => {
				const messageId = message.id || nanoid();
				set(state => {
					const modelMsgs = state.modelMessages[modelId] || {};
					const modelOrder = state.modelMessageOrder[modelId] || [];

					// Prevent adding duplicate message IDs
					if (modelOrder.includes(messageId)) {
						// If message already exists, maybe just update it
						const updatedMsgs = {
							...modelMsgs,
							[messageId]: { ...modelMsgs[messageId], ...message },
						};
						return {
							modelMessages: {
								...state.modelMessages,
								[modelId]: updatedMsgs,
							},
						};
					}

					return {
						modelMessages: {
							...state.modelMessages,
							[modelId]: {
								...modelMsgs,
								[messageId]: { ...message, id: messageId },
							},
							},
						modelMessageOrder: {
							...state.modelMessageOrder,
							[modelId]: [...modelOrder, messageId],
						},
					};
				});
				return messageId;
			},
			updateModelMessage: (modelId: string, messageId: string, update: Partial<ModelMessage>) => {
				set(state => {
					const modelMsgs = state.modelMessages[modelId] || {};
					if (!modelMsgs[messageId]) return state;

					const updatedMessage = {
						...modelMsgs[messageId],
						...update,
					};

					return {
						modelMessages: {
							...state.modelMessages,
							[modelId]: {
								...modelMsgs,
								[messageId]: updatedMessage,
							},
						},
					};
				});
			},
			getModelMessages: (modelId: string) => {
				const state = get();
				const order = state.modelMessageOrder[modelId] || [];
				const msgs = state.modelMessages[modelId] || {};
				return order.map(id => msgs[id]).filter(Boolean);
			},
			clearModelMessages: (modelId: string) => {
				set(state => ({
					modelMessages: {
						...state.modelMessages,
						[modelId]: {},
					},
					modelMessageOrder: {
						...state.modelMessageOrder,
						[modelId]: [],
					},
				}));
			},
			modelIsLoading: {},
			setModelIsLoading: (modelId: string, isLoading: boolean) => {
				set(state => ({
					modelIsLoading: {
						...state.modelIsLoading,
						[modelId]: isLoading,
					},
				}));
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

