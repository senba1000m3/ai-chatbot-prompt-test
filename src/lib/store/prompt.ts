import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "@/lib/utils";
import { useLoginStore } from "@/lib/store/prompt-login";

// Types & Interfaces
import type { CoreMessage } from "ai";
import type { SourcePart } from "@/types/chat";

export type ModelMessage = {
	spendTime?: number;
	rating?: "good" | "bad" | null;
	id?: string;
	model?: string;
	role: "user" | "assistant" | "system";
	content: string | undefined;
};

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
		hintMessage: HintMessage[];
		parameters: ParametersType;
		models: string[];
		tools: string[];
	};
}

type NewSavedVersion = Omit<SavedVersion, "id" | "savedAt" | "expanded">;

// 所有模型
export const availableModels = [
	{ id: "o4-mini", name: "o4-mini", category: "OpenAI", webSearch: false, isThinking: false },
	{ id: "o4-mini-thinking", name: "o4-mini (thinking)", category: "OpenAI", webSearch: false, isThinking: true },
	{ id: "o3-mini", name: "o3-mini", category: "OpenAI", webSearch: false, isThinking: false },
	{ id: "o3-mini-thinking", name: "o3-mini (thinking)", category: "OpenAI", webSearch: false, isThinking: true },
	{ id: "o3", name: "o3", category: "OpenAI", webSearch: false, isThinking: false },
	{ id: "o3-thinking", name: "o3 (thinking)", category: "OpenAI", webSearch: false, isThinking: true },
	{ id: "gpt-4.1", name: "GPT-4.1", category: "OpenAI", webSearch: true, isThinking: false },
	{ id: "gpt-4.1-mini", name: "GPT-4.1 mini", category: "OpenAI", webSearch: true, isThinking: false },
	{ id: "gpt-4.1-nano", name: "GPT-4.1 nano", category: "OpenAI", webSearch: false, isThinking: false },
	{ id: "gpt-4o", name: "GPT-4o", category: "OpenAI", webSearch: true, isThinking: false },
	{ id: "gpt-4o-mini", name: "GPT-4o mini", category: "OpenAI", webSearch: true, isThinking: false },
	{ id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", category: "Google", webSearch: true, isThinking: false },
	{ id: "gemini-2.5-flash-thinking", name: "Gemini 2.5 Flash (thinking)", category: "Google", webSearch: true, isThinking: true },
	{ id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", category: "Google", webSearch: true, isThinking: false },
	{ id: "gemini-2.5-flash-lite-thinking", name: "Gemini 2.5 Flash Lite (thinking)", category: "Google", webSearch: true, isThinking: true },
	{ id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", category: "Google", webSearch: true, isThinking: false },
	{ id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", category: "Google", webSearch: false, isThinking: false },
];

export interface PromptStoreProps {
	// Prompt 相關
	systemPrompt: SystemPromptData;
	setSystemPrompt: (updater: (prev: SystemPromptData) => SystemPromptData) => void;
	isSystemPromptOn: Record<string, boolean>;
	setIsSystemPromptOn: (key: string, value: boolean) => void;
	hintMessage: HintMessage[];
	setHintMessage: (hintMessage: HintMessage[]) => void;
	ifShowHintMessage: boolean;
	setIfShowHintMessage: (ifShowHintMessage: boolean) => void;

	parameters: ParametersType;
	setParameters: (params: Partial<ParametersType>) => void;

	inputMessage: string;
	setInputMessage: (value: string) => void;
	inputSendTimes: number;
	setInputSendTimes: (times: number) => void;
	ifInputDisabled: boolean;
	setIfInputDisabled: (disabled: boolean) => void;

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
	modelIsLoading: Record<string, boolean>; // 這邊 loading 是檢查是不是所有模型都回傳
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
	editVersion: (versionId: string) => void;
	editingVersionID: string;
	setEditingVersionID: (versionId: string) => void;
	resetVersion: () => void;
	clearAllVersions: () => void;
	updateVersionAccuracy: (versionId: string, modelId: string, accuracy: number) => void;
	untitledCounter: number;
	addUntitledCounter: () => void;
	resetUntitledCounter: () => void;

	// 版本比較
	showVersionHistory: boolean;
	setShowVersionHistory: (showVersionHistory: boolean) => void;
	compareSelectedVersions: string[];
	setCompareSelectedVersions: (versionsID: string) => void;
	clearCompareSelectedVersions: () => void;
	isCompareMode: boolean;
	setIsCompareMode: (isCompareMode: boolean) => void;
	isInCompareView: boolean;
	setIsInCompareView: (isInCompareView: boolean) => void;
	compareVersions: SavedVersion[];
	setCompareVersions: (versions: SavedVersion[]) => void;
	compareVersionsOrder: string[];
	setInitialVersionOrder: (versionsOrder: string[]) => void;
	onVersionReorder: (oldIndex: number, newIndex: number) => void;
	compareModelMessages: Record<string, Record<string, Record<string, ModelMessage>>>;
	appendCompareModelMessage: (versionId: string, modelId: string, message: ModelMessage) => string;
	updateMessageRating: (messageId: string, modelId: string, rating: "good" | "bad" | null, versionId?: string) => void;
	getCompareModelMessages: () => void;
	clearCompareModelMessages: () => void;
	compareSelectedModel: string;
	setCompareSelectedModel: (models: string) => void;

	// messageScrollRef: React.RefObject<HTMLDivElement>;
	// setMessageScrollRef: (ref: React.RefObject<HTMLDivElement>) => void;
	// scrollToBottom: () => void;
};

export const usePromptStore = create<PromptStoreProps>()(
	persist(
		(set, get) => ({
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
				set(state => {
					const newIsSystemPromptOn = { ...state.isSystemPromptOn };
					newIsSystemPromptOn[key] = value;
					return { isSystemPromptOn: newIsSystemPromptOn };
				});
			},
			hintMessage: [
				{ id: "1", content: "請幫我分析這個問題" },
				{ id: "2", content: "能否提供更詳細的說明？" },
			],
			setHintMessage: (hintMessage: HintMessage[]) => {
				set({ hintMessage })
			},
			ifShowHintMessage: true,
			setIfShowHintMessage: (ifShowHintMessage: boolean) => set({ ifShowHintMessage }),
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
			inputSendTimes: 1,
			setInputSendTimes: (times: number) => set({ inputSendTimes: times }),
			ifInputDisabled: false,
			setIfInputDisabled: (disabled: boolean) => set({ ifInputDisabled: disabled }),

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
			clearCompareModelMessages: () => {set({compareModelMessages: {},});},
			updateModelMessage: (modelId: string, messageId: string, update: Partial<ModelMessage>) => {
				set(state => {
					const modelMsgs = state.modelMessages[modelId] || {};
					if (!modelMsgs[messageId]) {
						return state; // Return original state if message not found
					}

					const updatedMessage = { ...modelMsgs[messageId], ...update } as ModelMessage;
					const newModelMsgs = { ...modelMsgs, [messageId]: updatedMessage };

					return {
						modelMessages: {
							...state.modelMessages,
							[modelId]: newModelMsgs,
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
				const state = get();
				set({
					modelMessages: {},
					modelMessageOrder: {}
				});
				state.setIfShowHintMessage(true);
				state.setInputSendTimes(1);
				state.setIfInputDisabled(false);
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
					hintMessage: data.hintMessage,
					selectedModels: data.models,
					selectedTools: data.tools,
					parameters: {
						temperature: data.parameters.temperature,
						batchSize: data.parameters.batchSize,
						parameter2: data.parameters.parameter2,
						parameter3: data.parameters.parameter3,
					},
				});
				get().setShowVersionHistory(false)
			},
			copyVersion: (version: SavedVersion) => {
				const { data } = version;
				set({
					systemPrompt: data.systemPrompt,
					hintMessage: data.hintMessage,
					selectedModels: data.models,
					selectedTools: data.tools,
					parameters: {
						temperature: data.parameters.temperature,
						batchSize: data.parameters.batchSize,
						parameter2: data.parameters.parameter2,
						parameter3: data.parameters.parameter3,
					},
				});
				get().setShowVersionHistory(false)
			},
			editVersion: (versionId: string) => {
				const state = get();
				set((prevState) => ({
					savedVersions: prevState.savedVersions.map((version) =>
						version.id === versionId
							? {
								...version,
								data: {
									systemPrompt: state.systemPrompt,
									hintMessage: state.hintMessage,
									parameters: state.parameters,
									models: state.selectedModels,
									tools: state.selectedTools,
								},
							}
							: version
					),
				}));
			},
			editingVersionID: "",
			setEditingVersionID: (versionId: string) => set({ editingVersionID: versionId }),
			resetVersion: () => {
				set({
					systemPrompt: {
						characterSettings: "",
						selfAwareness: "",
						workflow: "",
						formatLimits: "",
						usedTools: "",
						repliesLimits: "",
						preventLeaks: ""
					},
					hintMessage: [
						{ id: "1", content: "請幫我分析這個問題" },
						{ id: "2", content: "能否提供更詳細的說明？" },
					],
					selectedModels: ["gpt-4o", "gemini-2.0-flash"],
					selectedTools: [],
					parameters: {
						temperature: 0,
						batchSize: "1",
						parameter2: "",
						parameter3: "",
					},
				});
				get().setShowVersionHistory(false);
			},
			clearAllVersions: () => {
				set({ savedVersions: [] });
				get().resetUntitledCounter();
			},
			updateVersionAccuracy: (versionId: string, modelId: string, accuracy: number) => {
				set((state) => {
					const updateAccuracy = (version: SavedVersion) => {
						if (version.id === versionId) {
							const modelAccuracy = version.modelAccuracy.map((ma) =>
								ma.model === modelId ? { ...ma, accuracy } : ma
							);
							// Check if the model exists in modelAccuracy, if not, add it.
							if (!modelAccuracy.some(ma => ma.model === modelId)) {
								modelAccuracy.push({ model: modelId, accuracy });
							}
							return { ...version, modelAccuracy };
						}
						return version;
					};

					return {
						savedVersions: state.savedVersions.map(updateAccuracy),
						compareVersions: state.compareVersions.map(updateAccuracy),
					};
				});
			},

			// Untitled Counter
			untitledCounter: 1,
			addUntitledCounter: () =>
				set((state) => ({
					untitledCounter: state.untitledCounter + 1,
				})),
			resetUntitledCounter: () => set({ untitledCounter: 1 }),

			// 版本比較
			showVersionHistory: false,
			setShowVersionHistory: (showVersionHistory: boolean) => set({ showVersionHistory }),
			compareSelectedVersions: [],
			setCompareSelectedVersions: (versionsID: string) => {
				set((state) => {
					const prev = state.compareSelectedVersions;
					if (prev.includes(versionsID)) {
						return { compareSelectedVersions: prev.filter((id) => id !== versionsID) };
					}
					else {
						return { compareSelectedVersions: [...prev, versionsID] };
					}
				});
			},
			clearCompareSelectedVersions: () => set({ compareSelectedVersions: [] }),
			isCompareMode: false,
			setIsCompareMode: (isCompareMode: boolean) => set({ isCompareMode }),
			isInCompareView: false,
			setIsInCompareView: (isInCompareView: boolean) => set({ isInCompareView }),
			compareVersions: [],
			setCompareVersions: (versions: SavedVersion[]) => set({ compareVersions: versions }),
			compareVersionsOrder: [],
			setInitialVersionOrder: (versionsOrder: string[]) => set({ compareVersionsOrder: versionsOrder }),
			onVersionReorder: (oldIndex: number, newIndex: number) => {
				set(state => {
					const newOrder = [...state.compareVersionsOrder];
					const [movedItem] = newOrder.splice(oldIndex, 1);
					newOrder.splice(newIndex, 0, movedItem);
					// console.log(newOrder);
					return { compareVersionsOrder: newOrder };
				});
			},
			compareModelMessages: {},
			appendCompareModelMessage: (versionId: string, modelId: string, message: ModelMessage) => {
				const messageId = message.id || nanoid();
				set(state => {
					const versionMessages = state.compareModelMessages[versionId] || {};
					const modelMessages = versionMessages[modelId] || {};
					const modelOrder = Object.keys(modelMessages);

					if (modelOrder.includes(messageId)) {
						// If message already exists, maybe just update it
						const updatedMsgs = {
							...modelMessages,
							[messageId]: { ...modelMessages[messageId], ...message },
						};
						return {
							compareModelMessages: {
								...state.compareModelMessages,
								[versionId]: {
									...versionMessages,
									[modelId]: updatedMsgs,
								},
							},
						};
					}

					// console.log(`[CompareModelMessage] Version: ${versionId}, Model: ${modelId}, Message:`, message);
					return {
						compareModelMessages: {
							...state.compareModelMessages,
							[versionId]: {
								...versionMessages,
								[modelId]: {
									...modelMessages,
									[messageId]: { ...message, id: messageId },
								},
							},
						}
					};
				});
				return messageId;
			},
			updateMessageRating: (messageId: string, modelId: string, rating: "good" | "bad" | null, versionId?: string) => {
				set(state => {
					if (versionId) {
						// 更新比較模式下的訊息
						const versionMessages = state.compareModelMessages[versionId] || {};
						const modelMessages = versionMessages[modelId] || {};
						if (!modelMessages[messageId]) return state;

						const updatedMessage = { ...modelMessages[messageId], rating } as ModelMessage;

						return {
							compareModelMessages: {
								...state.compareModelMessages,
								[versionId]: {
									...versionMessages,
									[modelId]: {
										...modelMessages,
										[messageId]: updatedMessage,
									},
								},
							},
						};
					} else {
						// 更新一般模式下的訊息
						const modelMsgs = state.modelMessages[modelId] || {};
						if (!modelMsgs[messageId]) return state;

						const updatedMessage = { ...modelMsgs[messageId], rating } as ModelMessage;
						const newModelMsgs = { ...modelMsgs, [messageId]: updatedMessage };

						return {
							modelMessages: {
								...state.modelMessages,
								[modelId]: newModelMsgs,
							},
						};
					}
				});
			},
			getCompareModelMessages: () => {
				console.log(get().compareModelMessages);
			},
			compareSelectedModel: "gpt-4o",
			setCompareSelectedModel: (model: string) => {
				set({ compareSelectedModel: model });
			},
		}),
		{
			name: "chat-prompt-test",
			partialize: state => ({
				selectedModels: state.selectedModels,
				selectedTools: state.selectedTools,
				systemPrompt: state.systemPrompt,
				isSystemPromptOn: state.isSystemPromptOn,
				hintMessage: state.hintMessage,
				savedVersions: state.savedVersions,
				parameters: state.parameters,
			}),
			// onRehydrateStorage 仍可保留
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
			},
		}
	)
);

// 監聽 store 變化，手動備份
const keysToWatch = [
	'systemPrompt',
	'hintMessage',
	'parameters',
	'selectedModels',
	'selectedTools',
	'savedVersions',
	'untitledCounter',
	'editingVersionID',
	'inputMessage',
	'inputSendTimes',
	'ifInputDisabled',
	'isSystemPromptOn',
	'compareSelectedVersions',
	'isCompareMode',
	'isInCompareView',
	'compareVersions',
	'compareVersionsOrder',
	'compareModelMessages',
	'compareSelectedModel',
	'showVersionHistory',
];

usePromptStore.subscribe((state, prevState) => {
	for (const key of keysToWatch) {
		if ((state as any)[key] !== (prevState as any)[key]) {
			useLoginStore.getState().setPromptBackup({ ...state });
			break;
		}
	}
});

export type PromptStoreData = Omit<PromptStoreProps,
	| "setSystemPrompt"
	| "setIsSystemPromptOn"
	| "setHintMessage"
	| "setIfShowHintMessage"
	| "setParameters"
	| "setInputMessage"
	| "setInputSendTimes"
	| "setIfInputDisabled"
	| "setSelectedModels"
	| "setSelectedTools"
	| "appendModelMessage"
	| "updateModelMessage"
	| "getModelMessages"
	| "clearModelMessages"
	| "setModelIsLoading"
	| "setSavedVersions"
	| "addSavedVersion"
	| "updateSavedVersion"
	| "deleteVersion"
	| "toggleVersionExpanded"
	| "loadVersion"
	| "copyVersion"
	| "editVersion"
	| "setEditingVersionID"
	| "resetVersion"
	| "clearAllVersions"
	| "updateVersionAccuracy"
	| "addUntitledCounter"
	| "resetUntitledCounter"
	| "setShowVersionHistory"
	| "setCompareSelectedVersions"
	| "clearCompareSelectedVersions"
	| "setIsCompareMode"
	| "setIsInCompareView"
	| "setCompareVersions"
	| "setInitialVersionOrder"
	| "onVersionReorder"
	| "appendCompareModelMessage"
	| "updateMessageRating"
	| "getCompareModelMessages"
	| "clearCompareModelMessages"
	| "setCompareSelectedModel"
>;
