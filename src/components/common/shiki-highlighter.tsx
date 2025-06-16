"use client";
import { isValidElement, useCallback, useEffect, useRef, useState } from "react";
import { match } from "ts-pattern";
import { cn, copyToClipboard } from "@/lib/utils";

// Shiki
import ShikiHighlighter, {
	createHighlighterCore,
	createOnigurumaEngine,
} from "react-shiki/core";
import { bundledLanguages } from "shiki/bundle/web";
import OneLight from "@shikijs/themes/one-light"
import OneDarkPro from "@shikijs/themes/one-dark-pro";

// Components & UI
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Muted } from "./typography";
import { CopyButton } from "./motion-buttons";

// Singleton
let shikiHighlighterPromise: ReturnType<typeof createHighlighterCore> | null = null;

export async function getShikiHighlighter() {
	if (!shikiHighlighterPromise) {
		shikiHighlighterPromise = createHighlighterCore({
			themes: [OneLight, OneDarkPro],
			langs: Object.values(bundledLanguages),
			engine: createOnigurumaEngine(import("shiki/wasm")),
		});
	}

	return shikiHighlighterPromise;
}



export function Code({
	className,
	children,
	...props
}: React.ComponentProps<"pre">) {
	const [highlighter, setHighlighter] = useState<
		Awaited<ReturnType<typeof getShikiHighlighter>> | null
	>(null);
	const [showIsCopied, setShowIsCopied] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => { getShikiHighlighter().then(setHighlighter) }, []);

	const codeElement = isValidElement(children)
		? children.props as React.ComponentProps<"code">
		: null;
	const rawCode = codeElement?.children ?? "";
	const code = typeof rawCode === "string" ? rawCode : String(rawCode).trim();
	const codeClassName = codeElement?.className ?? "";
	const matchLang = codeClassName?.match(/language-(\w+)/);
	const language = matchLang ? matchLang[1] : "plaintext";

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

	if (!highlighter || !isValidElement(children)) return null;

	return (
		<div className="my-2 overflow-x-auto rounded-md">
			<div className="flex items-center justify-between px-4 py-2 bg-muted text-muted-foreground">
				<Muted className="font-mono text-sm">{language}</Muted>
				<Button
					variant="ghost"
					className="size-6"
					onClick={async () => handleCopy(code)}
					asChild
				>
					<CopyButton showIsCopied={showIsCopied} />
				</Button>
			</div>
			<ShikiHighlighter
				highlighter={highlighter}
				language={language}
				theme={{
					light: OneLight.name as string,
					dark: OneDarkPro.name as string,
				}}
				as="div"
				delay={100}
				showLanguage={false}
				showLineNumbers={language !== "plaintext"}
				className={cn(
					"text-sm [&_pre]:p-0! [&_pre]:px-5! [&_pre]:py-1.5! [&_pre]:rounded-t-none! [&_pre]:rounded-b-md!",
					className
				)}  // [&_pre]:whitespace-pre-wrap
				{...props}
			>
				{code}
			</ShikiHighlighter>
		</div>
	);
};