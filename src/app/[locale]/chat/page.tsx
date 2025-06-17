"use client";
import { useEffect, useState } from "react";
import { useChatStore } from "@/lib/store/chat";
import { useToolStore } from "@/lib/store/tool";
import { useTranslations } from "next-intl";
import { type Transition, AnimatePresence, motion } from "motion/react";

// Auth
import { useSession } from "@/lib/auth/client";

// Components & UI
import { Button } from "@/components/ui/button";
import { H2, MarkdownText } from "@/components/common/typography";

// Constants & Variables
const TRANSITION: Transition = { type: "spring", stiffness: 200, damping: 25 };
const HEADER_VARIANTS = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
};
const CONTAINER_VARIANTS = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.1 } },
};
const EXAMPLE_VARIANTS = {
	hidden: { opacity: 0, x: -20 },
	visible: { opacity: 1, x: 0, transition: TRANSITION },
};



export default function ChatPage() {
	const t = useTranslations("chat.welcome");
	const examples = t.raw("examples");

	const { data: session, isPending } = useSession();
	const name = session?.user?.name || "Guest";

	const [showHeader, setShowHeader] = useState(false);
	const isLoading = useChatStore(state => state.isLoading);
	const input = useChatStore(state => state.input);
	const setInput = useChatStore(state => state.setInput);

	// Handle chat change (mostly coming back from `/chat/[chatId]`)
	useEffect(() => {
		const handleChatChange = useChatStore.getState().handleChatChange;
		const setIsBlockOpen = useToolStore.getState().setIsBlockOpen;

		handleChatChange("");
		setIsBlockOpen(false);
	}, []);

	useEffect(() => {
		if (!input.trim() && !showHeader) setShowHeader(true);
		else if (input.trim() && showHeader) setShowHeader(false);
	}, [input, showHeader]);

	return (
		<div className="size-full grid">
			<AnimatePresence>
				{showHeader && !isPending && !isLoading && (
					<motion.header
						key="chat-header"
						className="max-w-2xl m-auto p-4"
						variants={HEADER_VARIANTS}
						initial="hidden"
						animate="visible"
						exit={HEADER_VARIANTS.hidden}
						transition={TRANSITION}
					>
						<H2 className="mb-4">{t("title", { name })}</H2>
						<motion.div
							variants={CONTAINER_VARIANTS}
							initial="hidden"
							animate="visible"
						>
							{Object.entries(examples).map(([key, value]) => (
								<motion.div
									key={key}
									className="py-1 not-last:border-b"
									variants={EXAMPLE_VARIANTS}
								>
									<Button
										variant="ghost"
										size="lg"
										className="justify-normal w-full h-auto px-3 py-2 text-muted-foreground text-left whitespace-normal"
										onClick={() => setInput(value as string)}
									>
										<MarkdownText>
											{value as string}
										</MarkdownText>
									</Button>
								</motion.div>
							))}
						</motion.div>
					</motion.header>
				)}
			</AnimatePresence>
		</div>
	);
}