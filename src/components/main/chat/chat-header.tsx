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
	visible: { transition: { staggerChildren: 0.01 } },
};
const TITLE_VARIANTS = {
	hidden: { opacity: 0, translateY: "0.5em", filter: "blur(4px)" },
	visible: { opacity: 1, translateY: 0, filter: "blur(0px)", transition: TRANSITION },
};



export function ChatLayoutHeader({ className }: React.ComponentProps<"header">) {
	const chatTitle = useChatStore(state => state.chatTitle);

	return (
		<header className={cn("grid grid-cols-[auto_auto_1fr] md:grid-cols-[auto_1fr] items-center gap-2 h-12 px-4 py-2 border-b", className)}>
			<div className="md:hidden flex gap-2 h-full -ml-2 mr-2">
				<SidebarTrigger />
				<Separator orientation="vertical" />
			</div>
			<motion.span
				key={chatTitle}
				className="font-semibold truncate"
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
			<div className="justify-self-end flex items-center gap-2">
				<ModeToggle />
			</div>
		</header>
	);
}