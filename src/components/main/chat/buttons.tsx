"use client";
import { useRef, useState } from "react";
import { redirect } from "next/navigation";
import { useTranslations } from "next-intl";
import { match } from "ts-pattern";
import { cn, copyToClipboard, nanoid } from "@/lib/utils";

// SWR
import { mutate } from "swr";
import fetcher from "@/lib/fetcher";

// Components & UI
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CopyButton, DeleteButton } from "@/components/common/motion-buttons";
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

// Icons & Images
import { Loader2, Share } from "lucide-react";

// Types & Interfaces
import type { Chat } from "@/lib/db/schema";



export function ChatShareButton({ className, chat, ...props }: React.ComponentProps<"button"> & { chat: Chat }) {
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

	async function handleShare(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault();
		setIsLoading(true);

		const shortId = nanoid(7);
		await fetcher(`/api/chats/${chat.id}`, {
			method: "PATCH",
			data: { shortId, public: true },
		}).then(() => {
			setIsLoading(false);
			mutate("/api/chats");
			handleCopy(`${window.location.origin}/chat/share/${shortId}`);
			toast.success(t("success"));
		}).catch(() => {
			setIsLoading(false);
			toast.error(t("failed"));
		});
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					className={cn("", className)}
					variant="ghost"
					size="icon"
					{...props}
				>
					<Share />
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
							variant="secondary"
							size="icon"
							onClick={() => handleCopy(link)}
							asChild
						>
							<CopyButton showIsCopied={showIsCopied} />
						</Button>
					</div>
				)}
				<DialogFooter>
					{!chat.public && (
						<Button
							type="button"
							onClick={async (e) => handleShare(e)}
						>
							{isLoading && <Loader2 className="animate-spin duration-200" />}
							{t("share")}
						</Button>
					)}
					<DialogClose asChild>
						<Button type="button" variant="outline">
							{t("close")}
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function ChatDeleteButton({ className, chat, ...props }: React.ComponentProps<"button"> & { chat: Chat }) {
	const t = useTranslations("chat.sidebar.delete");

	const [isLoading, setIsLoading] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	async function handleDelete() {
		setIsLoading(true);

		await fetcher(`/api/chats/${chat.id}`, {
			method: "DELETE",
		}).then(() => {
			setIsLoading(false);
			setIsDialogOpen(false);
			toast.success(t("success"), {
				duration: 2000,
				onAutoClose: () => {
					mutate("/api/chats");
					redirect("/chat");
				},
				onDismiss: () => {
					mutate("/api/chats");
					redirect("/chat");
				},
			});
		}).catch(() => {
			setIsLoading(false);
			toast.error(t("failed"));
		});
	}

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<Button
					className={cn("", className)}
					variant="ghost"
					size="icon"
					asChild
					{...props}
				>
					<DeleteButton>
					</DeleteButton>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{t("title")}
					</DialogTitle>
					<DialogDescription>
						{t("description", { name: chat.title })}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						type="submit"
						variant="destructive"
						onClick={handleDelete}
					>
						{isLoading && <Loader2 className="animate-spin duration-200" />}
						{t("delete")}
					</Button>
					<DialogClose asChild>
						<Button type="button" variant="outline">
							{t("cancel")}
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}