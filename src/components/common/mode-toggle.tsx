"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// Components & UI
import { Button } from "@/components/ui/button";

// Images & Icons
import { Monitor, Sun } from "lucide-react";
import { MoonIcon } from "@radix-ui/react-icons";

// Constants & Variables
const BUTTONS = [
	{ title: "Toggle light mode", icon: Sun, theme: "light" },
	{ title: "Toggle system theme", icon: Monitor, theme: "system" },
	{ title: "Toggle dark mode", icon: MoonIcon, theme: "dark" },
];



export function ModeToggle({ className }: React.ComponentProps<"div">) {
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme();

	useEffect(() => setMounted(true), []);

	return (
		<div className={cn("flex items-center w-max border rounded-full", className)}>
			{BUTTONS.map(button => (
				<Button
					key={button.theme}
					title={button.title}
					variant="ghost"
					className={cn("size-8 rounded-full", (mounted && button.theme === theme) && "!bg-accent border")}
					onClick={() => setTheme(button.theme)}
				>
					<button.icon className="!text-foreground" />
				</Button>
			))}
		</div>
	);
}