import { cn } from "@/lib/utils";

// Components & UI
import Link from "next/link";
import Image from "next/image";
import { Slot as SlotPrimitive } from "radix-ui";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

// Markdown
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";

// Shiki
import ShikiHighlighter, {
	createHighlighterCore,
	createOnigurumaEngine,
} from "react-shiki/core";
import { bundledLanguages } from "shiki/bundle/web";
import OneLight from "@shikijs/themes/one-light"
import OneDarkPro from "@shikijs/themes/one-dark-pro";

const highlighter = await createHighlighterCore({
	themes: [OneLight, OneDarkPro],
	langs: Object.values(bundledLanguages),
	engine: createOnigurumaEngine(import("shiki/wasm")),
});

// Types & Interfaces
import type { AsChild } from "@/types";
import { isValidElement } from "react";
export type MarkdownTextProps = {
	renderH1?: boolean;
}



function MarkdownText({
	renderH1 = true,
	...props
}: React.ComponentProps<typeof Markdown> & MarkdownTextProps) {
	return (
		<Markdown
			remarkPlugins={[remarkMath, remarkBreaks, [remarkGfm, { singleTilde: false }]]}
			rehypePlugins={[rehypeKatex]}
			components={{
				h1: ({ children, ...props }) => renderH1 ? <H1 id={extractId(children)} {...props}>{children}</H1> : null,
				h2: ({ children, ...props }) => <H2 id={extractId(children)} {...props}>{children}</H2>,
				h3: ({ children, ...props }) => <H3 id={extractId(children)} {...props}>{children}</H3>,
				h4: ({ children, ...props }) => <H4 id={extractId(children)} {...props}>{children}</H4>,
				h5: ({ children, ...props }) => <H5 id={extractId(children)} {...props}>{children}</H5>,
				h6: ({ children, ...props }) => <H6 id={extractId(children)} {...props}>{children}</H6>,
				ul: UL,
				ol: OL,
				li: LI,
				p: P,
				hr: ({ ...props }) => <hr className="mt-4 border-t" {...props} />,
				pre: Code,
				code: InlineCode,
				blockquote: Blockquote,
				a: ({ children, href, ...props }) => (
					href
						? <Anchor href={href} {...props}>{children}</Anchor>
						: <span {...props}>{children}</span>
				),
				img: ({ src, alt, width, height, ...props }) => {
					if (typeof src !== "string") return null;
					return(
						<Image
							src={src}
							alt={alt || ""}
							width={Number(width) || 720}
							height={Number(height) || 405}
							className="mx-auto my-2 rounded-lg object-cover"
							loading="lazy"
							{...props}
						/>
					);
				},
				table: ({ children, ...props }) => <Table className="overflow-x-auto" {...props}>{children}</Table>,
				thead: TableHeader,
				tbody: TableBody,
				tr: TableRow,
				th: TableHead,
				td: TableCell,
            }}
			{...props}
		/>
	);
}

function extractId(children: React.ReactNode): string | undefined {
	if (typeof children === "string") {
		return children.toString().toLowerCase().replace(/\s+/g, "-");
	}

	return undefined;
}

function Display({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"h1"> & AsChild) {
	const Comp = asChild ? SlotPrimitive.Slot : "h1";

	return <Comp className={cn("scroll-m-20 font-display text-5xl sm:text-6xl font-extrabold tracking-tight", className)} {...props} />;
}

function H1({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"h1"> & AsChild) {
	const Comp = asChild ? SlotPrimitive.Slot : "h1";

	return <Comp className={cn("scroll-m-20 text-3xl font-bold tracking-tight", className)} {...props} />;
}

function H2({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"h2"> & AsChild) {
	const Comp = asChild ? SlotPrimitive.Slot : "h2";

	return <Comp className={cn("mt-12 scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 [&+p]:!mt-4", className)} {...props} />;
}

function H3({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"h3"> & AsChild) {
	const Comp = asChild ? SlotPrimitive.Slot : "h3";

	return <Comp className={cn("mt-8 scroll-m-20 text-xl font-semibold tracking-tight first:mt-0 [&+p]:!mt-2", className)} {...props} />;
}

function H4({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"h4"> & AsChild) {
	const Comp = asChild ? SlotPrimitive.Slot : "h4";

	return <Comp className={cn("scroll-m-20 text-lg font-semibold tracking-tight", className)} {...props} />;
}

function H5({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"h5"> & AsChild) {
	const Comp = asChild ? SlotPrimitive.Slot : "h5";

	return <Comp className={cn("scroll-m-20 text-base font-medium tracking-tight", className)} {...props} />;
}

function H6({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"h6"> & AsChild) {
	const Comp = asChild ? SlotPrimitive.Slot : "h6";

	return <Comp className={cn("scroll-m-20 text-sm font-medium tracking-tight", className)} {...props} />;
}

function UL({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"ul"> & AsChild) {
	const Comp = asChild ? SlotPrimitive.Slot : "ul";

	return <Comp className={cn("list-disc list-outside [&:not(:first-child)]:mt-1 pl-6 marker:text-xs marker:text-[color-mix(in_oklch,_var(--primary),_white_20%)]", className)} {...props} />;
}

function OL({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"ol"> & AsChild) {
	const Comp = asChild ? SlotPrimitive.Slot : "ol";

	return <Comp className={cn("list-decimal list-outside [&:not(:first-child)]:mt-1 pl-6 marker:text-[color-mix(in_oklch,_var(--primary),_white_20%)]", className)} {...props} />;
}

function LI({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"li"> & AsChild) {
	const Comp = asChild ? SlotPrimitive.Slot : "li";

	return <Comp className={cn("leading-relaxed my-1 pl-1", className)} {...props} />;
}

function P({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"p"> & AsChild) {
	const Comp = asChild ? SlotPrimitive.Slot : "p";

	return <Comp className={cn("leading-relaxed [&:not(:first-child)]:mt-4", className)} {...props} />;
}

function Muted({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"p"> & AsChild) {
	const Comp = asChild ? SlotPrimitive.Slot : "p";

	return <Comp className={cn("text-muted-foreground text-xs", className)} {...props} />;
}

function Code({
	className,
	children,
	...props
}: React.ComponentProps<"pre">) {
	if (!isValidElement(children)) return null;

	const {
		className: codeClassName,
		children: code
	} = children.props as React.ComponentProps<"code">;
	const match = codeClassName?.match(/language-(\w+)/);
	const language = match ? match[1] : "plaintext";

	return (
		<ShikiHighlighter
			highlighter={highlighter}
			language={language}
			theme={OneDarkPro}
			// TODO: Theme breaks when passing light and dark themes
			// theme={{
			// 	light: OneLight,
			// 	dark: OneDarkPro,
			// }}
			defaultColor="dark"
			as="div"
			delay={100}
			showLanguage={false}
			showLineNumbers={language !== "plaintext"}
			className={cn("overflow-hidden text-sm [&_pre]:rounded-t-none! py-2", className)}  // [&_pre]:whitespace-pre-wrap
			{...props}
		>
			{String(code).trim()}
		</ShikiHighlighter>
	);
};

function InlineCode({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"code"> & AsChild) {
	const Comp = asChild ? SlotPrimitive.Slot : "code";

	return <Comp className={cn("bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm", className)} {...props} />;
}

function Blockquote({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"blockquote"> & AsChild) {
	const Comp = asChild ? SlotPrimitive.Slot : "blockquote";

	return <Comp className={cn("border-[color-mix(in_oklch,_var(--primary),_white_10%)] border-l-3 pl-6 font-serif italic [&:not(:first-child)]:mt-4", className)} {...props} />;
}

function Anchor({
	className,
	href,
	...props
}: React.ComponentProps<"a"> & { href: string }) {
	return (
		<Link
			href={href}
			className={cn("font-medium text-primary hover:text- underline underline-offset-4", className)}
			{...props}
		/>
	);
}

export {
	MarkdownText,
	Display,
	H1, H2, H3, H4, H5, H6,
	UL, OL, LI, P,
	Muted,
	Code,
	InlineCode,
	Blockquote,
	Anchor,
};