import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types & Interfaces
interface ThemeStoreProps {
	preset: string;
	setPreset: (preset: string) => void;
}



export const useThemeStore = create<ThemeStoreProps>()(
	persist(
		set => ({
			preset: "default",
			setPreset: (preset: string) => set({ preset }),
		}),
		{ name: "tau-theme" }
	)
);