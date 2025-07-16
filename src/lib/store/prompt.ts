import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "@/lib/utils";

// Types & Interfaces
import type { CoreMessage } from "ai";
import type { SourcePart } from "@/types/chat";

export interface ModelMessage extends CoreMessage {
	spendTime?: number;
}

export interface HintMessage {
	id: string;
	content: string;
}

export interface SystemPromptData {
	characterSettings: string;
	selfAwareness: string;
	workflow: string;
	formatLimits: string;
	usedTools: string;
	repliesLimits: string;
	preventLeaks: string;
}

export interface ModelAccuracy {
	model: string;
	accuracy: number;
}

export interface ParametersType {
	temperature: number;
	batchSize: string;
	parameter2: string;
	parameter3: string;
}

export interface SavedVersion {
	id: string;
	name: string;
	expanded: boolean;
	savedAt: Date;
	modelAccuracy: ModelAccuracy[];
	data: {
		systemPrompt: SystemPromptData;
		userPrompt: HintMessage[];
		parameters: ParametersType;
		models: string[];
		tools: string[];
	};
}

type NewSavedVersion = Omit<SavedVersion, "id" | "savedAt" | "expanded">;

interface PromptStoreProps {
	/* Unused */
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
	character: string;
	setCharacter: (character: string) => void;
	useWebSearch: boolean;
	setUseWebSearch: (useWebSearch: boolean) => void;
	handleChatChange: (newChatId: string) => void;
	sources: Record<string, string[]>;
	appendSource: (source: SourcePart) => void;
	messages: Record<string, CoreMessage>;
	messageOrderArray: string[];
	appendMessage: (message: CoreMessage) => void;
	getMessageArray: () => CoreMessage[];
	messageExists: (id: string) => boolean;
	clearMessages: () => void;
	/* ----- */

	/* Used */
	hasScrolledToBottom: boolean;
	setHasScrolledToBottom: (hasScrolled: boolean) => void;

	// Prompt Used
	systemPrompt: SystemPromptData;
	setSystemPrompt: (updater: (prev: SystemPromptData) => SystemPromptData) => void;
	isSystemPromptOn: Record<string, boolean>;
	setIsSystemPromptOn: (key: string, value: boolean) => void;
	userPrompt: HintMessage[];
	setUserPrompt: (userPrompt: HintMessage[]) => void;
	totalPrompts: string;
	setTotalPrompts: () => void;

	parameters: ParametersType;
	setParameters: (params: Partial<ParametersType>) => void;

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
	clearModelMessages: () => void;
	modelIsLoading: Record<string, boolean>;
	setModelIsLoading: (modelId: string, isLoading: boolean) => void;

	// SavedVersion 管理
	savedVersions: SavedVersion[];
	setSavedVersions: (versions: SavedVersion[]) => void;
	addSavedVersion: (version: NewSavedVersion) => void;
	updateSavedVersion: (id: string, version: Partial<SavedVersion>) => void;
	deleteVersion: (versionId: string) => void;
	toggleVersionExpanded: (versionId: string) => void;
	loadVersion: (version: SavedVersion) => void;
	copyVersion: (version: SavedVersion) => void;
	clearAllVersions: () => void;

	untitledCounter: number;
	addUntitledCounter: () => void;
	resetUntitledCounter: () => void;
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

			systemPrompt: {
				characterSettings: "",
				selfAwareness: "",
				workflow: "",
				formatLimits: "",
				usedTools: "",
				repliesLimits: "",
				preventLeaks: ""
			},
			setSystemPrompt: (updater) => {
				set(state => ({ systemPrompt: updater(state.systemPrompt) }));
				get().setTotalPrompts();
			},
			isSystemPromptOn: {
				characterSettings: true,
				selfAwareness: true,
				workflow: true,
				formatLimits: true,
				usedTools: true,
				repliesLimits: true,
				preventLeaks: true
			},
			setIsSystemPromptOn: (key: string, value: boolean) => {
				const { setTotalPrompts } = get();
				set(state => {
					const newIsSystemPromptOn = { ...state.isSystemPromptOn };
					newIsSystemPromptOn[key] = value;
					return { isSystemPromptOn: newIsSystemPromptOn };
				});
				setTotalPrompts();
			},
			userPrompt: [
				{ id: "1", content: "請幫我分析這個問題" },
				{ id: "2", content: "能否提供更詳細的說明？" },
			],
			setUserPrompt: (userPrompt: HintMessage[]) => {
				set({ userPrompt })
			},
			totalPrompts: "",
			setTotalPrompts: () => {
				const { systemPrompt, isSystemPromptOn } = get();
				const currentPrompts: string[] = [];

				Object.entries(systemPrompt).forEach(([key, prompt]) => {
					if (isSystemPromptOn[key]) {
						currentPrompts.push("\n【"+key+"】");
						currentPrompts.push(prompt);
					}
				});

				set({ totalPrompts: currentPrompts.join("\n").trim() });
				console.log(currentPrompts.join("\n"));
			},
			parameters: {
				temperature: 0,
				batchSize: "1",
				parameter2: "",
				parameter3: "",
			},
			setParameters: (params: Partial<ParametersType>) => {
				set(state => ({
					parameters: {
						...state.parameters,
						...params,
					},
				}));
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
				// console.log(`[ModelMessage] Model: ${modelId}, Message:`, message);
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
			clearModelMessages: () => {
				set({
					modelMessages: {},
					modelMessageOrder: {}
				});
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



			// SavedVersion 管理
			savedVersions: [],
			setSavedVersions: (versions) => set({ savedVersions: versions }),
			addSavedVersion: (version) => set((state) => {
					const modelAccuracy = version.data.models.map(model => ({ model, accuracy: 0 }));
					const newVersion: SavedVersion = {
						id: nanoid(),
						savedAt: new Date(),
						expanded: false,
						...version,
						modelAccuracy,
					};
					if (version.name.startsWith("Untitled")) {
						state.addUntitledCounter();
					}
					console.log(newVersion);
					return { savedVersions: [newVersion, ...state.savedVersions] };
				}),
			updateSavedVersion: (id, updatedVersion) =>
				set((state) => ({
					savedVersions: state.savedVersions.map((version) =>
						version.id === id ? { ...version, ...updatedVersion } : version
					)
				})),
			deleteVersion: (versionId: string) => {
				set((state) => ({
					savedVersions: state.savedVersions.filter((v) => v.id !== versionId)
				}));
			},
			toggleVersionExpanded: (versionId: string) =>
				set((state) => ({
					savedVersions: state.savedVersions.map((version) =>
						version.id === versionId ? { ...version, expanded: !version.expanded } : version
					)
				})),
			loadVersion: (version: SavedVersion) => {
				const { data } = version;
				set({
					systemPrompt: data.systemPrompt,
					userPrompt: data.userPrompt,
					selectedModels: data.models,
					selectedTools: data.tools,
					parameters: {
						temperature: data.parameters.temperature,
						batchSize: data.parameters.batchSize,
						parameter2: data.parameters.parameter2,
						parameter3: data.parameters.parameter3,
					},
				});
			},
			copyVersion: (version: SavedVersion) => {
				const { data } = version;
				set({
					systemPrompt: data.systemPrompt,
					userPrompt: data.userPrompt,
					selectedModels: data.models,
					selectedTools: data.tools,
					parameters: {
						temperature: data.parameters.temperature,
						batchSize: data.parameters.batchSize,
						parameter2: data.parameters.parameter2,
						parameter3: data.parameters.parameter3,
					},
				});
			},
			clearAllVersions: () => {
				set({ savedVersions: [] });
				get().resetUntitledCounter();
			},

			// Untitled Counter
			untitledCounter: 1,
			addUntitledCounter: () =>
				set((state) => ({
					untitledCounter: state.untitledCounter + 1,
				})),
			resetUntitledCounter: () => set({ untitledCounter: 1 }),
		}),
		{
			name: "tau-chat",
			partialize: state => ({
				selectedModels: state.selectedModels,
				selectedTools: state.selectedTools,
				systemPrompt: state.systemPrompt,
				isSystemPromptOn: state.isSystemPromptOn,
				userPrompt: state.userPrompt,
				savedVersions: state.savedVersions,
			}),
			onRehydrateStorage: () => (state) => {
				if (state) {
					const maxCounter = state.savedVersions.reduce((max, version) => {
						if (version.name.startsWith("Untitled ")) {
							const num = parseInt(version.name.split(" ")[1], 10);
							if (!isNaN(num) && num > max) {
								return num;
							}
						}
						return max;
					}, 0);
					state.untitledCounter = maxCounter + 1;
				}
			}
		}
	)
);

