"use client";
import { useRouter, usePathname } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import {
	isThisMonth,
	isThisWeek,
	isThisYear,
	isToday,
} from "date-fns";

// SWR
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

// Components & UI
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

// Icons & Images
import { MessagesSquare } from "lucide-react";

// Types & Interfaces
import type { Chat } from "@/lib/db/schema";



export function ChatSidebarChats() {
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations("chat.sidebar.dates");

	const { data, error, isLoading } = useSWR<Chat[]>(
		"/api/chats", async (url: string) => {
			const response = await fetcher(url);
			if (!response.success) throw new Error(response.message);
			return response.data;
		}
	);
	const chats = data || [];
	const chatGroups = groupChatsByTime(chats);

	return (
		isLoading ? (
			<SidebarGroup>
				<SidebarMenu>
					{Array.from({ length: 5 }).map((_, index) => (
						<SidebarMenuItem key={index}>
							<SidebarMenuButton disabled asChild>
								<Skeleton className="duration-400" />
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroup>
		) :
		<>
			{chatGroups.map(({ label, items }) => (
				<SidebarGroup key={label}>
					<SidebarGroupLabel>
						{t(label)}
					</SidebarGroupLabel>
					<SidebarMenu>
						{items.map((chat) => (
							<SidebarMenuItem key={chat.id}>
								<SidebarMenuButton
									tooltip={`${t(label)}: ${chat.title}`}
									isActive={pathname === `/chat/${chat.id}`}
									onClick={() => router.push(`/chat/${chat.id}`)}
								>
									<MessagesSquare />
									{chat.title}
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>
			))}
		</>
	);
}

function groupChatsByTime(chats: Chat[]) {
	chats.sort((a, b) => {
		const aUpdatedAt = new Date(a.updatedAt).getTime();
		const bUpdatedAt = new Date(b.updatedAt).getTime();

		return bUpdatedAt - aUpdatedAt;
	});

	const thisYear = new Date().getFullYear();
	const groups: Record<string, Chat[]> = {
		today: [],
		this_week: [],
		this_month: [],
		this_year: [],
		last_year: [],
		legacy: [],
	};

	for (const chat of chats) {
		const updatedAt = new Date(chat.updatedAt);
		const year = updatedAt.getFullYear();

		if (isToday(updatedAt)) {
			groups.today.push(chat);
		} else if (isThisWeek(updatedAt)) {
			groups.this_week.push(chat);
		} else if (isThisMonth(updatedAt)) {
			groups.this_month.push(chat);
		} else if (isThisYear(updatedAt)) {
			groups.this_year.push(chat);
		} else if (year === thisYear - 1) {
			groups.last_year.push(chat);
		} else {
			groups.legacy.push(chat);
		}
	}

	return Object.entries(groups)
		.filter(([, items]) => items.length > 0)
		.map(([label, items]) => ({ label, items }));
}