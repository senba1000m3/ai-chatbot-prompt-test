import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AdvancedStoreProps {
	testMessageDataset: string[];
	setTestMessageDataset: (dataset: string[]) => void;
}

export const useAdvancedStore = create<AdvancedStoreProps>()(
	persist(
		(set, get) => ({
			testMessageDataset: [],
			setTestMessageDataset: (dataset: string[]) => set({ testMessageDataset: dataset }),
		}),
		{
			name: "tai-factory-advanced",
			partialize: state => ({
			}),
		}
	)
);