import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"

// Components & UI
import { Slot } from "@radix-ui/react-slot";
import { H1, H2, H3, H4, H5, H6 } from "./typography";

// Constants & Variables
const sectionVariants = cva(
	"",
	{
		variants: {
			titleAs: {
				h1: "py-8",
				h2: "py-6",
				h3: "py-3",
				h4: "py-2",
				h5: "py-1",
				h6: "py-1",
			},
		},
		defaultVariants: {
			titleAs: "h2",
		},
	}
);

const HEADING_MAP = {
	h1: H1,
	h2: H2,
	h3: H3,
	h4: H4,
	h5: H5,
	h6: H6,
} as const;

// Types & Interfaces
import type { VariantProps } from "class-variance-authority";
import type { AsChild } from "@/types";
interface WrapperLayoutProps {
	width?: number;
}
interface SectionLayoutProps {
	title?: string;
}



function WrapperLayout({
	children,
	className,
	width = 1440,
	asChild = false,
	...props
}: React.ComponentProps<"div"> & WrapperLayoutProps & AsChild) {
	const Comp = asChild ? Slot : "div";

	return (
		<Comp
			style={{ maxInlineSize: `${width}px` }}
			className={cn("@container mx-auto px-4 md:px-8", className)}
			{...props}
		>
			{children}
		</Comp>
	);
}

function SectionLayout({
	children,
	className,
	title = "",
	titleAs = "h2",
	...props
}: React.ComponentProps<"section"> & VariantProps<typeof sectionVariants> & SectionLayoutProps) {
	const TitleComp = HEADING_MAP[titleAs || "h2"];

	return (
		<section className={cn(sectionVariants({ titleAs, className }))} {...props}>
			{title && <TitleComp>{title}</TitleComp>}
			{children}
		</section>
	);
}

export { WrapperLayout, SectionLayout };