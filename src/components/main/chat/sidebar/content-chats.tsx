"use client";
import { useRef, useState } from "react";
import { useRouter, usePathname } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import {
	isThisMonth,
	isThisWeek,
	isThisYear,
	isToday,
} from "date-fns";
import { match } from "ts-pattern";
import { copyToClipboard, nanoid } from "@/lib/utils";

// SWR
import useSWR, { mutate } from "swr";
import fetcher from "@/lib/fetcher";

// Components & UI
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/common/motion-buttons";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

// Icons & Images
import { Loader2, MessageCircleQuestion, MessagesSquare, Share } from "lucide-react";

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

	if (error) {
		return (
			<SidebarGroup>
				<SidebarGroupLabel>
					<MessageCircleQuestion />
				</SidebarGroupLabel>
			</SidebarGroup>
		);
	}

	return (
		isLoading ? (
			<SidebarGroup>
				<SidebarGroupLabel>
					{t("date")}
				</SidebarGroupLabel>
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
									className="relative group/button"
									tooltip={`${t(label)}: ${chat.title}`}
									isActive={pathname === `/chat/${chat.id}`}
									onClick={() => router.push(`/chat/${chat.id}`)}
								>
									<MessagesSquare />
									<span className="truncate">{chat.title}</span>
									<div className="opacity-0 group-hover/button:opacity-100 absolute right-2 top-1/2 -translate-y-1/2 transition-opacity bg-sidebar-accent mask-l-from-80% group-hover/button:mask-l-to-transparent group-data-[collapsible=icon]:hidden">
										<ShareButton chat={chat} />
									</div>
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

function ShareButton({ chat }: { chat: Chat }) {
	const t = useTranslations("chat.sidebar.share");

	const [isLoading, setIsLoading] = useState(false);
	const [showIsCopied, setShowIsCopied] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const link = `${window.location.origin}/chat/share/${chat.shortId}`;

	async function handleCopy(link: string) {
		const copyResult = await copyToClipboard(link);
		match(copyResult)
			.with({ success: true }, () => {
				if (timeoutRef.current) clearTimeout(timeoutRef.current);
				setShowIsCopied(true);
				timeoutRef.current = setTimeout(() => {
					setShowIsCopied(false);
					timeoutRef.current = null;
				}, 3000);
			})
			.with({ success: false }, ({ message }) => {
				toast.error(
					"A small 🤏🌌 issue occurred...",
					{ description: message }
				);
			})
			.exhaustive();
	};

	async function handleShare() {
		setIsLoading(true);
		const shortId = nanoid(7);
		await fetcher(`/api/chats/${chat.id}`, {
			method: "PATCH",
			data: { shortId, public: true },
		}).then(() => {
			setIsLoading(false);
			mutate("/api/chats");
			handleCopy(`${window.location.origin}/chat/share/${shortId}`);
			toast.success("Chat link has been shared successfully.");
		});
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					asChild
				>
					<div><Share /></div>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{t("title")}
					</DialogTitle>
					<DialogDescription>
						{!chat.public && <> {t("irreversible")} </>}{t("description")}
					</DialogDescription>
				</DialogHeader>
				{chat.public && (
					<div className="flex items-center gap-2">
						<div className="flex-1 grid gap-2">
							<Label htmlFor="link" className="sr-only">{t("link")}</Label>
							<Input
								id="link"
								defaultValue={link}
							/>
						</div>
						<Button
							variant="outline"
							size="icon"
							onClick={() => handleCopy(link)}
							asChild
						>
							<CopyButton showIsCopied={showIsCopied} />
						</Button>
					</div>
				)}
				<div>
				</div>
				<DialogFooter>
					{!chat.public && (
						<Button
							type="button"
							onClick={handleShare}
						>
							{isLoading && <Loader2 className="animate-spin duration-200" />}
							{t("share")}
						</Button>
					)}
					<DialogClose asChild>
						<Button type="button" variant="secondary">
							{t("close")}
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}