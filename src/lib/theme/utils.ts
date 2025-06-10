import { COMMON_STYLES, presets } from "./presets";

// Types & Interfaces
import type { ThemeStyles, ThemeStyleProps } from "@/types/theme";



export function getPresetThemeStyles(name: string): ThemeStyles {
	if (name === "default") return presets.default;

	const preset = presets[name];
	if (!preset) return presets.default;

	return {
		light: {
			...presets.default.light,
			...(preset.light || {}),
		},
		dark: {
			...presets.default.dark,
			...(preset.dark || {}),
		},
	};
}

export function getThemeColor(preset: string, color: keyof ThemeStyleProps) {
	const theme = getPresetThemeStyles(preset);
	return theme?.light?.[color] || theme?.dark?.[color] || "#000000";
}

export function applyCommonStyles(root: HTMLElement, themeStyles: ThemeStyles) {
	Object.entries(themeStyles)
		.filter(([key]) => COMMON_STYLES.includes(key as (typeof COMMON_STYLES)[number]))
		.forEach(([key, value]) => {
			if (typeof value === "string") {
				root.style.setProperty(`--${key}`, value);
			}
		});
}

export function applyThemeColors(root: HTMLElement, themeStyles: ThemeStyles, mode: keyof ThemeStyles) {
	Object.entries(themeStyles[mode]).forEach(([key, value]) => {
		if (typeof value === "string" && !COMMON_STYLES.includes(key as (typeof COMMON_STYLES)[number])) {
			root.style.setProperty(`--${key}`, value);
		}
	});
}