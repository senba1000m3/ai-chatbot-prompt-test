"use client";
import { useEffect } from "react";

import { ThemeProvider, useTheme } from "next-themes";
import { useThemeStore } from "@/lib/store/theme";
import {
	applyCommonStyles,
	applyThemeColors,
	getPresetThemeStyles,
} from "@/lib/theme/utils";

// Components & UI
import { Toaster } from "@/components/ui/sonner";



export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<ShadcnProvider>
				{children}
				<Toaster />
			</ShadcnProvider>
		</ThemeProvider>
	);
}

function ShadcnProvider({ children }: { children: React.ReactNode }) {
	const { preset } = useThemeStore();
	const { resolvedTheme: mode } = useTheme();

	useEffect(() => {
		const root = document.documentElement;
		const theme = getPresetThemeStyles(preset);

		if (mode === "light" || mode === "dark") {
			applyThemeColors(root, theme, mode);
			applyCommonStyles(root, theme);
		}
	}, [preset, mode]);

	return children;
}