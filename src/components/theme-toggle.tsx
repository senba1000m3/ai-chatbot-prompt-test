"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

// Components & UI
import { Button } from "@/components/ui/button";

// Images & Icons
import { Monitor, Sun } from "lucide-react";
import { MoonIcon } from "@radix-ui/react-icons";

// Constants & Variables
const BUTTONS = [
	{ title: "切換至淺色模式", icon: <Sun />, theme: "light" },
	{ title: "切換至系統主題", icon: <Monitor />, theme: "system" },
	{ title: "切換至黑暗模式", icon: <MoonIcon />, theme: "dark" },
];



export function ThemeToggle() {
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme();

	useEffect(() => setMounted(true), []);

	return (
		<div className="flex items-center gap-0.5 w-max border border-input rounded-full">
			{BUTTONS.map(button => (
				<Button
					key={button.theme}
					title={button.title}
					variant="ghost"
					className={`size-8 rounded-full ${mounted && button.theme === theme ? "bg-accent" : ""}`}
					onClick={() => setTheme(button.theme)}
				>
					{button.icon}
				</Button>
			))}
		</div>
	);
}