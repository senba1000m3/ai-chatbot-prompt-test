"use client";
import { useCallback, useRef, useState } from "react";
import { useToolStore } from "@/lib/store/tool";
import { useTranslations } from "next-intl";
import { match } from "ts-pattern";
import { cn, copyToClipboard } from "@/lib/utils";
import { getChatModel } from "@/lib/chat/models";

// Components & UI
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CopyButton, FileTextButton } from "@/components/common/motion-buttons";
import { MarkdownText, Muted } from "@/components/common/typography";
import {  MessageContent } from "@/components/ui/message";

// Icons & Images
import { ExternalLink } from "lucide-react";

// Types & Interfaces
import type { CoreMessage } from "ai";
import { SourcePart } from "@/types/chat";



export function MessageContentRenderer({
	children,
	content,
	sources,
	...props
}: Omit<React.ComponentProps<typeof MessageContent>, "content">
	& { content: CoreMessage["content"]; sources?: SourcePart["source"][] }
) {
	const t = useTranslations("chat.content");
	const setIsBlockOpen = useToolStore(state => state.setIsBlockOpen);
	const setActiveToolResultId = useToolStore(state => state.setActiveToolResultId);

	if (typeof content === "string") {
		return !content.trim()
			? null
			: (
				<MarkdownText>
					{content.trim()}
				</MarkdownText>
			);
	}

	return (
		<MessageContent {...props}>
			{content.map((part, index) =>
				match(part)
					.with({ type: "text" }, (part) => (
						<MarkdownText key={index}>
							{part.text}
						</MarkdownText>
					))
					.with({ type: "image" }, () => (
						<div key={index}>Image content here</div>
					))
					.with({ type: "file" }, () => (
						<div key={index}>File content here</div>
					))
					.with({ type: "reasoning" }, () => (
						<div key={index}>Reasoning content here</div>
					))
					.with({ type: "redacted-reasoning" }, () => (
						<div key={index}>Redacted reasoning content here</div>
					))
					.with({ type: "tool-call", toolName: "step_block" }, (part) => (
						<Button
							key={index}
							variant="outline"
							size="lg"
							className="w-fit my-2"
							onClick={() => {
								setActiveToolResultId(part.toolCallId);
								setIsBlockOpen(true);
							}}
							asChild
						>
							<FileTextButton>
								{t("tools.open_step_blocks")}
							</FileTextButton>
						</Button>
					))
					// TODO: Null for now
					.with({ type: "tool-call" }, () => null)
					// Type `tool-result` messages are only for AI
					.with({ type: "tool-result" }, () => null)
					.exhaustive()
			)}
			{sources && (
				<div className="flex items-center my-2">
					{sources.map(source => (
						<a
							key={source.id}
							href={source.url}
							title={source.title}
							className="inline-flex items-center justify-center size-8 not-first:-ml-2 bg-primary text-primary-foreground border-2 border-background rounded-full shrink-0"
							target="_blank"
							rel="noopener noreferrer"
						>
							<ExternalLink className="shrink-0 size-4 pointer-events-none" />
						</a>
					))}
				</div>
			)}
			{children}
		</MessageContent>
	);
}

export function MessageToolbarRenderer({
	className,
	role,
	content,
	metadata,
}: Omit<React.ComponentProps<"div">, "content">
	& { role: string, content: CoreMessage["content"], metadata?: Record<string, any> }
) {
	const [showIsCopied, setShowIsCopied] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const handleCopy = useCallback(async (code: string) => {
		const copyResult = await copyToClipboard(code);
		match(copyResult)
			.with({ success: true }, () => {
				if (timeoutRef.current) clearTimeout(timeoutRef.current);
				setShowIsCopied(true);
				timeoutRef.current = setTimeout(() => {
					setShowIsCopied(false);
					timeoutRef.current = null;
				}, 3000);
			})
			.with({ success: false }, ({ message }) => {
				toast.error(
					"A small 🤏🌌 issue occurred...",
					{ description: message }
				);
			})
			.exhaustive();
	}, []);

	const stringifiedContent = typeof content === "string"
		? content.trim()
		: (content).map(part => {
			return (part.type === "text")
				? part.text
				: "";
		}).filter(Boolean).join("\n");

	return (
		<div className={cn(
			"absolute bottom-0 flex items-center gap-2 w-full py-1 translate-y-full",
			role === "user"
				? "right-0 justify-end"
				: "left-0",
			className
		)}>
			<Button
				variant="ghost"
				size="icon"
				className="text-accent-foreground"
				onClick={async () => handleCopy(stringifiedContent)}
				asChild
			>
				<CopyButton showIsCopied={showIsCopied} />
			</Button>
			{role === "assistant" && metadata ? (
				<Muted>{getChatModel(metadata?.model)?.name || metadata?.model}</Muted>
			) : null}
		</div>
	);
}