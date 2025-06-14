"use client";
import { useRouter, usePathname } from "@/lib/i18n/navigation";
import { useChatStore } from "@/lib/store/chat";
import { useTranslations } from "next-intl";
import {
	isThisMonth,
	isThisWeek,
	isThisYear,
	isToday,
	parseISO,
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

// Icons & Images
import { MessagesSquare } from "lucide-react";

type Chat = {
	id: string;
	title: string;
	updatedAt: string;
};



export function ChatSidebarChats() {
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations("chat.sidebar.dates");
	const setChatId = useChatStore(state => state.setChatId);

	const { data, error, isLoading } = useSWR("/api/chats", fetcher);
	const chats = data?.data || [];

	const chatGroups = groupChatsByTime(chats);

	return (
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
									onClick={() => {
										setChatId(chat.id);
										router.push(`/chat/${chat.id}`);
									}}
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
		const updatedAt = parseISO(chat.updatedAt);
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