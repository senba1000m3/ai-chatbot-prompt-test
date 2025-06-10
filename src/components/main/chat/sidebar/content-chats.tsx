"use client";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
	isThisMonth,
	isThisWeek,
	isThisYear,
	isToday,
	parseISO,
} from "date-fns";

// Components & UI
import Link from "next/link";
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
	updated_at: string;
};

const CHATS: Chat[] = [
	{
		id: "LUQrKIg",
		title: "Project Kickoff",
		updated_at: "2025-06-11T02:00:10.979337Z"
	},
	{
		id: "xYb5yLf",
		title: "UI Feedback",
		updated_at: "2025-06-09T02:00:10.979337Z"
	},
	{
		id: "J8LYDkF",
		title: "API Integration",
		updated_at: "2025-06-07T02:00:10.979337Z"
	},
	{
		id: "h24W3Qv",
		title: "Localization Setup",
		updated_at: "2025-06-03T02:00:10.979337Z"
	},
	{
		id: "wIVnRBr",
		title: "Performance Debugging",
		updated_at: "2025-05-27T02:00:10.979337Z"
	},
	{
		id: "RIo8v2l",
		title: "Feature Planning",
		updated_at: "2025-05-11T02:00:10.979337Z"
	},
	{
		id: "ObTvQMN",
		title: "Bug Triage",
		updated_at: "2025-04-11T02:00:10.979337Z"
	},
	{
		id: "uXUhB8J",
		title: "Team Sync",
		updated_at: "2025-03-12T02:00:10.979337Z"
	},
	{
		id: "Q5XLMtt",
		title: "Security Review",
		updated_at: "2024-12-12T02:00:10.979337Z"
	},
	{
		id: "bFOk3Bq",
		title: "Release Retrospective",
		updated_at: "2023-06-10T02:00:10.979337Z"
	}
];



export function ChatSidebarChats() {
	const pathname = usePathname();
	const t = useTranslations("chat.sidebar.dates");

	const chatGroups = groupChatsByTime(CHATS);

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
									asChild
								>
									<Link href={`/chat/${chat.id}`}>
										<MessagesSquare />
										{chat.title}
									</Link>
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
		const updatedAt = parseISO(chat.updated_at);
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