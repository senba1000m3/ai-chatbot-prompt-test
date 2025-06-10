"use client";
import { useTranslations } from "next-intl";

// Components & UI
import Link from "next/link";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

// Images & Icons
import { FileText } from "lucide-react";



export function ChatSidebarDocs({ className }: React.ComponentProps<"div">) {
	const t = useTranslations("chat.sidebar");

	return (
		<SidebarGroup className={className}>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton asChild>
						<Link href="https://youtu.be/v1POP-m76ac" target="_blank" rel="noreferrer noopener">
							<FileText />
							<span>{t("docs")}</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	);
}