import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "@/lib/utils";
import { usePromptStore, type HintMessage, type PromptStoreData } from "@/lib/store/prompt";

// Types & Interfaces
export interface TestArea {
	name: string
}

export interface TestAreaWithData extends TestArea {
	id: string
	createdAt: string
	updatedAt: string
	author: string
	data: PromptStoreData
}

interface LoginStoreProps {
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
	setPromptBackup: (backup: PromptStoreData) => void;
	loadPromptBackup: (backup: PromptStoreData) => void;
}

// 取得 PromptStoreProps 的純資料預設值
function getDefaultPromptStoreData(get: () => LoginStoreProps): PromptStoreData {
	const defaultHintMessage = get().defaultHintMessage || [];

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

export const useLoginStore = create<LoginStoreProps>()(
	persist(
		(set, get) => ({
			nickname: "",
			setNickname: (nickname: string) => set({ nickname }),

			testAreas: [],
			nowTestAreaId: "",
			setNowTestAreaId: (id: string) => set({ nowTestAreaId: id }),
			addTestArea: (testArea: TestArea) => {
				try {
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
					const originalArea = get().testAreas.find(area => area.id === id);
					if (!originalArea) return undefined;
					const duplicatedArea: TestAreaWithData = {
						...originalArea,
						id: nanoid(7),
						name: `${originalArea.name} (複製)`,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						data: originalArea.data ?? ({} as PromptStoreData),
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
			setPromptBackup: (backup: PromptStoreData) => {
				const { nowTestAreaId, testAreas } = get();
				const updatedTestAreas = testAreas.map(area =>
					area.id === nowTestAreaId ? { ...area, data: backup } : area
				);

				// console.log(updatedTestAreas);
				set({ testAreas: updatedTestAreas });
			},
			loadPromptBackup: (backup: PromptStoreData) => {
				usePromptStore.setState({
					...backup
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

