import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type SavedVersion, type ModelMessage } from "./prompt";

export interface RatingCategory {
	category_id: string;
	name: string;
}

export interface Rubric {
	rubric_id: string;
	category_id: string;
	content: string;
}

export interface VersionRating {
    [versionId: string]: {
        [modelId: string]: {
            [rubric_id: string]: number;
        };
    };
}

export interface TestResult {
	id: string;
	timestamp: number;
	versionId: string;
	modelId: string;
	messages: { [versionId: string]: { [modelId: string]: Record<string, ModelMessage> } };
	ratings: VersionRating;
}

export interface TestMessage {
	id: string;
	message: string;
	require: string;
}

export interface TestMessageSet {
	id: string;
	name: string;
	messages: TestMessage[];
}

export interface AdvancedStoreProps {
	selectedView: string;
	setSelectedView: (view: string) => void;

	// 訊息測試集
	testMessageDatasets: TestMessageSet[];
	setTestMessageDatasets: (datasets: TestMessageSet[]) => void;
	visibleTestSetIds: string[];
	setVisibleTestSetIds: (ids: string[]) => void;
	addTestMessageSet: (name: string) => void;
	deleteTestMessageSet: (id: string) => void;
	updateTestMessageSetName: (id: string, newName: string) => void;
	addMessageToSet: (setId: string, message: Omit<TestMessage, "id">) => void;
	updateMessageInSet: (
		setId: string,
		messageId: string,
		updatedMessage: Partial<Omit<TestMessage, "id">>
	) => void;
	deleteMessageFromSet: (setId: string, messageId: string) => void;

	// 評分量表
	ratingCategories: RatingCategory[];
	setRatingCategories: (categories: RatingCategory[]) => void;
	rubrics: Rubric[];
	setRubrics: (rubrics: Rubric[]) => void;

    versionRatings: VersionRating;
    setVersionRating: (versionId: string, modelId: string, rubric_id: string, score: number) => void;
    clearVersionRatings: (versionId: string, modelId: string) => void;
	testResults: TestResult[];
	addTestResult: (result: Omit<TestResult, "id" | "timestamp">) => void;
	deleteTestResult: (id: string) => void;
	clearTestResults: () => void;
    isRatingInProgress: boolean;
    setIsRatingInProgress: (isRating: boolean) => void;
}

export const useAdvancedStore = create<AdvancedStoreProps>()(
	persist(
		(set, get) => ({
			selectedView: "version",
			setSelectedView: (view: string) => set({ selectedView: view }),
			testMessageDatasets: [],
			setTestMessageDatasets: (datasets: TestMessageSet[]) => set({ testMessageDatasets: datasets }),
			visibleTestSetIds: [],
			setVisibleTestSetIds: (ids: string[]) => set({ visibleTestSetIds: ids }),
			addTestMessageSet: name => {
				const newSet: TestMessageSet = {
					id: `set-${Date.now()}`,
					name,
					messages: [],
				};
				set(state => ({
					testMessageDatasets: [...state.testMessageDatasets, newSet],
					visibleTestSetIds: [...state.visibleTestSetIds, newSet.id],
				}));
			},
			deleteTestMessageSet: id => {
				set(state => ({
					testMessageDatasets: state.testMessageDatasets.filter(set => set.id !== id),
					visibleTestSetIds: state.visibleTestSetIds.filter(visibleId => visibleId !== id),
				}));
			},
			updateTestMessageSetName: (id, newName) => {
				set(state => ({
					testMessageDatasets: state.testMessageDatasets.map(set =>
						set.id === id ? { ...set, name: newName } : set
					),
				}));
			},
			addMessageToSet: (setId, message) => {
				const newMessage: TestMessage = { ...message, id: `msg-${Date.now()}` };
				set(state => ({
					testMessageDatasets: state.testMessageDatasets.map(set =>
						set.id === setId ? { ...set, messages: [...set.messages, newMessage] } : set
					),
				}));
			},
			updateMessageInSet: (setId, messageId, updatedMessage) => {
				set(state => ({
					testMessageDatasets: state.testMessageDatasets.map(set =>
						set.id === setId
							? {
									...set,
									messages: set.messages.map(msg =>
										msg.id === messageId ? { ...msg, ...updatedMessage } : msg
									),
							  }
							: set
					),
				}));
			},
			deleteMessageFromSet: (setId, messageId) => {
				set(state => ({
					testMessageDatasets: state.testMessageDatasets.map(set =>
						set.id === setId
							? { ...set, messages: set.messages.filter(msg => msg.id !== messageId) }
							: set
					),
				}));
			},
			ratingCategories: [],
			setRatingCategories: (categories: RatingCategory[]) => set({ ratingCategories: categories }),
			rubrics: [],
			setRubrics: (rubrics: Rubric[]) => set({ rubrics: rubrics }),
            versionRatings: {},
            setVersionRating: (versionId, modelId, rubric_id, score) =>
                set(state => ({
                    versionRatings: {
                        ...state.versionRatings,
                        [versionId]: {
                            ...state.versionRatings[versionId],
                            [modelId]: {
                                ...state.versionRatings[versionId]?.[modelId],
                                [rubric_id]: score,
                            },
                        },
                    },
                })),
            clearVersionRatings: (versionId, modelId) =>
                set(state => {
                    const newRatings = { ...state.versionRatings };
                    if (newRatings[versionId]?.[modelId]) {
                        delete newRatings[versionId][modelId];
                        if (Object.keys(newRatings[versionId]).length === 0) {
                            delete newRatings[versionId];
                        }
                    }
                    return { versionRatings: newRatings };
                }),
			testResults: [],
			addTestResult: (result) => {
				const newTestResult: TestResult = {
					...result,
					id: `test-${Date.now()}`,
					timestamp: Date.now(),
				};
				set(state => ({ testResults: [...state.testResults, newTestResult] }));
			},
			deleteTestResult: (id) =>
				set((state) => ({
					testResults: state.testResults.filter((result) => result.id !== id),
				})),
			clearTestResults: () => set({ testResults: [] }),
            isRatingInProgress: false,
            setIsRatingInProgress: (isRating) => set({ isRatingInProgress: isRating }),
		}),
		{
			name: "tai-factory-advanced",
			partialize: state => ({
				testMessageDatasets: state.testMessageDatasets,
				visibleTestSetIds: state.visibleTestSetIds,
				ratingCategories: state.ratingCategories,
				rubrics: state.rubrics,
                versionRatings: state.versionRatings,
				testResults: state.testResults,
                isRatingInProgress: state.isRatingInProgress,
				selectedView: state.selectedView,
			}),
		}
	)
);

