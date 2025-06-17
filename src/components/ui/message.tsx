import * as React from "react";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

// Constants & Variables
import { ICON_IMG_URL } from "@/lib/constant";

// Types
type MessageProps = {
	role?: "user" | "assistant" | "tool" | "system";
	showAvatar?: boolean;
	keepAvatarSpace?: boolean;
	avatarSrc?: string;
	avatarAlt?: string;
	avatarFallback?: string;
};



function MessageGroup({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("@container/message-group flex flex-col gap-10", className)}
			{...props}
		/>
	);
}

const messageVariants = cva(
	"relative flex gap-x-3 py-1.5",
	{
		variants: {
			side: {
				left: "flex-row",
				right: "flex-row-reverse",
			},
		},
		defaultVariants: {
			side: "left",
		},
	},
);

function Message({
	className,
	children,
	side,
	role = "user",
	showAvatar = true,
	keepAvatarSpace = false,
	avatarSrc = ICON_IMG_URL,
	avatarAlt = "Avatar",
	avatarFallback = "T",
	...props
}: React.ComponentProps<"div"> &
	VariantProps<typeof messageVariants> & MessageProps) {
	const shouldRenderAvatar = showAvatar || keepAvatarSpace;

	return (
		<div
			className={cn(
				messageVariants({ side }),
				(!showAvatar && keepAvatarSpace) && "after:block after:size-10 after:shrink-0",
				className
			)}
			data-role={role}
			{...props}
		>
			{shouldRenderAvatar && (
				<Avatar>
					{showAvatar && (
						<>
							<AvatarImage
								className="select-none pointer-events-none"
								src={avatarSrc}
								alt={avatarAlt}
							/>
							<AvatarFallback>{avatarFallback}</AvatarFallback>
						</>
					)}
				</Avatar>
			)}
			{children}
		</div>
	);
}

const messageContentVariants = cva(
	"relative grid items-center",
	{
		variants: {
			variant: {
				default: "grow",  // text-justify
				bubble: "px-4 py-3 bg-secondary text-secondary-foreground rounded-2xl",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function MessageContent({
	className,
	variant,
	...props
}: React.ComponentProps<"div"> &
	VariantProps<typeof messageContentVariants>) {
	return (
		<div
			className={cn(messageContentVariants({ variant }), className)}
			{...props}
		/>
	);
}

const messageSeparatorVariants = cva(
	"relative flex items-center gap-4 my-2 py-2 w-full font-semibold text-xs before:block after:block before:h-[0.5px] after:h-[0.5px] before:grow after:grow",
	{
		variants: {
			variant: {
				default: "text-muted-foreground before:bg-muted-foreground after:bg-muted-foreground",
				unread: "text-destructive before:bg-destructive after:bg-destructive",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function MessageSeparator({
	className,
	children,
	variant = "default",
	...props
}: React.ComponentProps<"div"> &
	VariantProps<typeof messageSeparatorVariants>) {
	return (
		<div
			className={cn(messageSeparatorVariants({ variant }), className)}
			{...props}
		>
			{children}
			{variant === "unread" && (
				<span
					className="absolute right-0 top-1/2 -translate-y-1/2 px-1.5 bg-destructive text-white uppercase rounded-sm select-none"
				>
					NEW
				</span>
			)}
		</div>
	);
}

export { Message, MessageContent, MessageGroup, MessageSeparator };