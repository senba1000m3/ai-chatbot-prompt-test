"use client";
import { cn } from "@/lib/utils";



export default function ChatLayoutHeader({ className }: React.ComponentProps<"header">) {
	return (
		<header className={cn("flex items-center gap-1 h-12 px-4 py-2 border-b", className)}>
		</header>
	);
}