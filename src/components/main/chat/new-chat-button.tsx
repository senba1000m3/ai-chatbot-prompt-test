"use client";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// Components & UI
import Link from "next/link";

// Images & Icons
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";



export function NewChatButton({ className }: React.ComponentProps<"button">) {
	const t = useTranslations("chat.sidebar");

	return (
		<Button
			className={cn("btn-chrome mt-[0.3125rem] ml-[0.3125rem] w-[calc(100%_-_0.625rem)] h-6 group-data-[collapsible=icon]:[&>svg]:ml-2 [&>span:last-child]:truncate", className)}
			asChild
		>
			<Link href="/chat">
				<MessageSquarePlus />
				<span>{t("add_new_chat")}</span>
			</Link>
		</Button>
	);
}