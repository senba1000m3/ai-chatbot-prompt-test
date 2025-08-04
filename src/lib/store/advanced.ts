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

export interface AdvancedStoreProps {
	testMessageDataset: string[];
	setTestMessageDataset: (dataset: string[]) => void;

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
			testMessageDataset: [],
			setTestMessageDataset: (dataset: string[]) => set({ testMessageDataset: dataset }),
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
				testMessageDataset: state.testMessageDataset,
				ratingCategories: state.ratingCategories,
				rubrics: state.rubrics,
                versionRatings: state.versionRatings,
				testResults: state.testResults,
                isRatingInProgress: state.isRatingInProgress,
			}),
		}
	)
);

