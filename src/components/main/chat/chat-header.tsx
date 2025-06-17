"use client";
import { useChatStore } from "@/lib/store/chat";
import { type Transition, motion } from "motion/react";
import { cn } from "@/lib/utils";

// Components & UI
import { ModeToggle } from "@/components/common/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

// Constants & Variables
const TRANSITION: Transition = { type: "spring", stiffness: 200, damping: 25 };
const CONTAINER_VARIANTS = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.015 } },
};
const TITLE_VARIANTS = {
	hidden: { opacity: 0, translateY: "0.5em", filter: "blur(4px)" },
	visible: { opacity: 1, translateY: 0, filter: "blur(0px)", transition: TRANSITION },
};



export function ChatLayoutHeader({ className }: React.ComponentProps<"header">) {
	const chatTitle = useChatStore(state => state.chatTitle);

	return (
		<header className={cn("flex items-center justify-between gap-4 h-12 px-4 py-2 max-md:pl-2 border-b", className)}>
			<div className="flex items-center gap-1 h-full">
				<SidebarTrigger className="md:hidden" />
				<Separator className="md:hidden mr-2" orientation="vertical" />
				<motion.span
					key={chatTitle}
					className="inline-flex"
					variants={CONTAINER_VARIANTS}
					initial="hidden"
					animate="visible"
				>
					{chatTitle.replace(/ /g, "\u00A0").split("").map((char, index) => (
						<motion.span
							key={index}
							variants={TITLE_VARIANTS}
						>
							{char}
						</motion.span>
					))}
				</motion.span>
			</div>
			<div>
				<ModeToggle />
			</div>
		</header>
	);
}