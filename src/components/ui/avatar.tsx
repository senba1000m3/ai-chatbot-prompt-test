"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const avatarFallbackVariants = cva(
	"flex size-full items-center justify-center rounded-full",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground",
				muted: "bg-zinc-400 dark:bg-zinc-600 text-white",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
)

function Avatar({
	className,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
	return (
		<AvatarPrimitive.Root
			data-slot="avatar"
			className={cn(
				"relative flex size-10 shrink-0 overflow-hidden rounded-full",
				className
			)}
			{...props}
		/>
	)
}

function AvatarImage({
	className,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
	return (
		<AvatarPrimitive.Image
			data-slot="avatar-image"
			className={cn("aspect-square size-full", className)}
			{...props}
		/>
	)
}

function AvatarFallback({
	className,
	variant,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback> &
	VariantProps<typeof avatarFallbackVariants>) {
	return (
		<AvatarPrimitive.Fallback
			data-slot="avatar-fallback"
			className={cn(avatarFallbackVariants({ variant, className }))}
			{...props}
		/>
	)
}

export { Avatar, AvatarImage, AvatarFallback }