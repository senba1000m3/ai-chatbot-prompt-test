import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "@/lib/utils";
import { usePromptStore, type PromptStoreProps, type HintMessage } from "@/lib/store/prompt";

// Types & Interfaces
export interface TestArea {
	name: string
}

export interface TestAreaWithData extends TestArea {
	id: string
	createdAt: string
	updatedAt: string
	author: string
	data: PromptStoreProps
}

interface NicknameStoreProps {
	// 名字
	nickname: string;
	setNickname: (nickname: string) => void;

	// 測試區（產線）
	testAreas: TestAreaWithData[];
	nowTestAreaId: string;
	setNowTestAreaId: (id: string) => void;
	addTestArea: (area: TestArea) => TestAreaWithData | undefined;
	deleteTestArea: (id: string) => void;
	duplicateTestArea: (id: string) => TestAreaWithData | undefined;
	getTestArea: (id: string) => TestAreaWithData | undefined;

	// 預設參數
	defaultHintMessage: HintMessage[];
	setDefaultHintMessage: (messages: string[]) => void;

	// 備份與載入
	setPromptBackup: (backup: PromptStoreProps) => void;
	loadPromptBackup: (backup: PromptStoreProps) => void;
}

// 取得 PromptStoreProps 的純資料預設值
function getDefaultPromptStoreData(get: () => NicknameStoreProps): PromptStoreProps {
	const defaultHintMessage = get().defaultHintMessage || [];
	// @ts-ignore
	return {
		systemPrompt: {
			characterSettings: "",
			selfAwareness: "",
			workflow: "",
			formatLimits: "",
			usedTools: "",
			repliesLimits: "",
			preventLeaks: "",
		},
		isSystemPromptOn: {
			characterSettings: true,
			selfAwareness: true,
			workflow: true,
			formatLimits: true,
			usedTools: true,
			repliesLimits: true,
			preventLeaks: true,
		},
		hintMessage: defaultHintMessage,
		ifShowHintMessage: true,
		parameters: {
			temperature: 0,
			batchSize: "",
			parameter2: "",
			parameter3: "",
		},
		inputMessage: "",
		inputSendTimes: 0,
		ifInputDisabled: false,
		selectedModels: ["gpt-4o", "gemini-2.0-flash"],
		selectedTools: [],
		modelMessages: {},
		modelMessageOrder: {},
		modelIsLoading: {},
		savedVersions: [],
		editingVersionID: "",
		untitledCounter: 0,
		showVersionHistory: false,
		compareSelectedVersions: [],
		isCompareMode: false,
		isInCompareView: false,
		compareVersions: [],
		compareVersionsOrder: [],
		compareModelMessages: {},
		compareSelectedModel: "gpt-4o"
	};
}

export const useNicknameStore = create<NicknameStoreProps>()(
	persist(
		(set, get) => ({
			nickname: "",
			setNickname: (nickname: string) => set({ nickname }),

			testAreas: [],
			nowTestAreaId: "",
			setNowTestAreaId: (id: string) => set({ nowTestAreaId: id }),
			addTestArea: (testArea: TestArea) => {
				try {
					const nanoid = require("nanoid").nanoid;
					const nickname = get().nickname;
					const newTestArea: TestAreaWithData = {
						...testArea,
						id: nanoid(7),
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						author: nickname,
						data: getDefaultPromptStoreData(get),
					};
					set(state => ({ testAreas: [...state.testAreas, newTestArea] }));
					return newTestArea;
				} catch {
					return undefined;
				}
			},
			deleteTestArea: (id: string) => {
				set(state => ({ testAreas: state.testAreas.filter(area => area.id !== id) }));
			},
			duplicateTestArea: (id: string) => {
				try {
					const nanoid = require("nanoid").nanoid;
					const originalArea = get().testAreas.find(area => area.id === id);
					if (!originalArea) return undefined;
					const duplicatedArea: TestAreaWithData = {
						...originalArea,
						id: nanoid(7),
						name: `${originalArea.name} (複製)`,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						data: originalArea.data ?? ({} as PromptStoreProps),
					};
					set(state => ({ testAreas: [...state.testAreas, duplicatedArea] }));
					return duplicatedArea;
				} catch {
					return undefined;
				}
			},
			getTestArea: (id: string) => {
				return get().testAreas.find(area => area.id === id);
			},

			defaultHintMessage: [],
			setDefaultHintMessage: (messages: string[]) => set(() => {
				const messagesWithId = messages.map((message) => ({
					id: nanoid(10),
					content: message,
				}));
				return { defaultHintMessage: messagesWithId };
			}),
			setPromptBackup: (backup: PromptStoreProps) => {
				const { nowTestAreaId, testAreas } = get();
				const updatedTestAreas = testAreas.map(area =>
					area.id === nowTestAreaId ? { ...area, data: backup } : area
				);
				set({ testAreas: updatedTestAreas });
			},
			loadPromptBackup: (backup: PromptStoreProps) => {
				usePromptStore.setState({
					systemPrompt: backup.systemPrompt,
					isSystemPromptOn: backup.isSystemPromptOn,
					hintMessage: backup.hintMessage,
					ifShowHintMessage: backup.ifShowHintMessage,
					parameters: backup.parameters,
					inputMessage: backup.inputMessage,
					inputSendTimes: backup.inputSendTimes,
					ifInputDisabled: backup.ifInputDisabled,
					selectedModels: backup.selectedModels,
					selectedTools: backup.selectedTools,
					modelMessages: backup.modelMessages,
					modelMessageOrder: backup.modelMessageOrder,
					modelIsLoading: backup.modelIsLoading,
					savedVersions: backup.savedVersions,
					editingVersionID: backup.editingVersionID,
					untitledCounter: backup.untitledCounter,
					showVersionHistory: backup.showVersionHistory,
					compareSelectedVersions: backup.compareSelectedVersions,
					isCompareMode: backup.isCompareMode,
					isInCompareView: backup.isInCompareView,
					compareVersions: backup.compareVersions,
					compareVersionsOrder: backup.compareVersionsOrder,
					compareModelMessages: backup.compareModelMessages,
					compareSelectedModel: backup.compareSelectedModel,
				});
			},
		}),
		{
			name: "user-nickname",
		    partialize: state => ({
		  		nickname: state.nickname,
				testAreas: state.testAreas
		  	}),
		}
	)
);

