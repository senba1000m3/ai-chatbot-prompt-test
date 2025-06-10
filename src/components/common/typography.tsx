import { cn } from "@/lib/utils";

// Components & UI
import Link from "next/link";
import Image from "next/image";
import { Slot } from "@radix-ui/react-slot";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Markdown
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Types & Interfaces
import type { AsChild } from "@/types";
export type MarkdownTextProps = {
	renderH1?: boolean;
}



function MarkdownText({
	renderH1 = true,
	...props
}: React.ComponentProps<typeof Markdown> & MarkdownTextProps) {
	return (
		<Markdown
			remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
			components={{
				h1: ({ children, ...props }) => renderH1 ? <H1 id={extractId(children)} {...props}>{children}</H1> : null,
				h2: ({ children, ...props }) => <H2 id={extractId(children)} {...props}>{children}</H2>,
				h3: ({ children, ...props }) => <H3 id={extractId(children)} {...props}>{children}</H3>,
				h4: ({ children, ...props }) => <H4 id={extractId(children)} {...props}>{children}</H4>,
				h5: ({ children, ...props }) => <H5 id={extractId(children)} {...props}>{children}</H5>,
				h6: ({ children, ...props }) => <H6 id={extractId(children)} {...props}>{children}</H6>,
				hr: ({ ...props }) => <hr className="mt-4 border-t" {...props} />,
				p: ({ children, ...props }) => <P {...props}>{children}</P>,
				a: ({ children, href, ...props }) => (
					href
						? <Anchor href={href} {...props}>{children}</Anchor>
						: <span {...props}>{children}</span>
				),
				pre: ({ children, ...props }) => <pre className="max-w-full overflow-x-auto" {...props}>{children}</pre>,
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
				table: ({ children, ...props }) => <Table {...props}>{children}</Table>,
				thead: ({ children, ...props }) => <TableHeader {...props}>{children}</TableHeader>,
				tbody: ({ children, ...props }) => <TableBody {...props}>{children}</TableBody>,
				tr: ({ children, ...props }) => <TableRow {...props}>{children}</TableRow>,
				th: ({ children, ...props }) => <TableHead {...props}>{children}</TableHead>,
				td: ({ children, ...props }) => <TableCell {...props}>{children}</TableCell>,
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
	const Comp = asChild ? Slot : "h1";

	return <Comp className={cn("scroll-m-20 font-display text-5xl sm:text-6xl font-extrabold tracking-tight", className)} {...props} />;
}

function H1({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"h1"> & AsChild) {
	const Comp = asChild ? Slot : "h1";

	return <Comp className={cn("scroll-m-20 text-3xl font-bold tracking-tight", className)} {...props} />;
}

function H2({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"h2"> & AsChild) {
	const Comp = asChild ? Slot : "h2";

	return <Comp className={cn("mt-12 scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 [&+p]:!mt-4", className)} {...props} />;
}

function H3({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"h3"> & AsChild) {
	const Comp = asChild ? Slot : "h3";

	return <Comp className={cn("mt-8 scroll-m-20 text-xl font-semibold tracking-tight [&+p]:!mt-2", className)} {...props} />;
}

function H4({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"h4"> & AsChild) {
	const Comp = asChild ? Slot : "h4";

	return <Comp className={cn("scroll-m-20 text-lg font-semibold tracking-tight", className)} {...props} />;
}

function H5({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"h5"> & AsChild) {
	const Comp = asChild ? Slot : "h5";

	return <Comp className={cn("scroll-m-20 text-base font-medium tracking-tight", className)} {...props} />;
}

function H6({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"h6"> & AsChild) {
	const Comp = asChild ? Slot : "h6";

	return <Comp className={cn("scroll-m-20 text-sm font-medium tracking-tight", className)} {...props} />;
}

function P({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"p"> & AsChild) {
	const Comp = asChild ? Slot : "p";

	return <Comp className={cn("leading-relaxed [&:not(:first-child)]:mt-4", className)} {...props} />;
}

function Blockquote({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"blockquote"> & AsChild) {
	const Comp = asChild ? Slot : "blockquote";

	return <Comp className={cn("border-l-2 pl-6 font-serif italic", className)} {...props} />;
}

function InlineCode({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"code"> & AsChild) {
	const Comp = asChild ? Slot : "code";

	return <Comp className={cn("bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold", className)} {...props} />;
}

function Muted({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"p"> & AsChild) {
	const Comp = asChild ? Slot : "p";

	return <Comp className={cn("text-muted-foreground text-xs", className)} {...props} />;
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
	P,
	Blockquote,
	InlineCode,
	Muted,
	Anchor,
};