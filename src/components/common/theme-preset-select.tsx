"use client";
import { getThemeColor } from "@/lib/theme/utils";
import { cn } from "@/lib/utils";

// Components & UI
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

// Types & Interfaces
import type { ThemeStyles } from "@/types/theme";
type ThemePresetSelectProps = {
	className?: string;
	presets: Record<string, ThemeStyles>;
	currentPreset: string | null;
	onPresetChange: (preset: string) => void;
};



export function ThemePresetSelect({
	className,
	presets,
	currentPreset,
	onPresetChange,
	...props
}: ThemePresetSelectProps) {
	const presetNames = Object.keys(presets);
	const value = presetNames?.find(name => name === currentPreset) || "default";

	return (
		<Select value={value} onValueChange={onPresetChange} {...props}>
			<SelectTrigger className={cn("", className)}>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{presetNames.map((name) => (
					<SelectItem key={name} value={name} className="flex items-center gap-3">
					<div className="max-sm:hidden size-6 bg-background rounded border p-1">
						<div className="grid grid-rows-2 grid-cols-2 gap-[2px] size-full">
							<div className="rounded-[2px]" style={{ backgroundColor: getThemeColor(name, "primary") }}></div>
							<div className="rounded-[2px]" style={{ backgroundColor: getThemeColor(name, "destructive") }}></div>
							<div className="rounded-[2px]" style={{ backgroundColor: getThemeColor(name, "secondary") }}></div>
							<div className="rounded-full" style={{ backgroundColor: getThemeColor(name, "accent") }}></div>
						</div>
					</div>
						<span>{name.replace(/-/g, " ").replace(/\b\w/g, char => char.toUpperCase())}</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}