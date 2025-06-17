"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut, useSession } from "@/lib/auth/client";
import { useThemeStore } from "@/lib/store/theme";

// Components & UI
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LocaleSelect } from "@/components/common/locale-select";
import { Muted } from "@/components/common/typography";
import {
	SidebarFooter,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ThemePresetSelect } from "@/components/common/theme-preset-select";
import { ModeToggle } from "@/components/common/mode-toggle";

// Images & Icons
import { ChevronsUpDown, Globe, Loader2, LogIn, LogOut, Palette, Settings2, SunMoon } from "lucide-react";

// Constants & Variables
import { ICON_IMG_URL } from "@/lib/constant";
import { presets } from "@/lib/theme/presets";



export function ChatSidebarFooter() {
	return (
		<SidebarFooter className="border-t">
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<FooterDropdownMenuTrigger />
						<FooterDropdownMenuContent />
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarFooter>
	);
}

function FooterDropdownMenuTrigger() {
	const t = useTranslations("common");

	const { data: session, isPending } = useSession();
	const image = session?.user?.image;
	const name = session?.user?.name;
	const email = session?.user?.email;
	// const role = session?.user?.role;

	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	return (
		<DropdownMenuTrigger asChild>
			<SidebarMenuButton size="lg" className="gap-3">
				<Avatar className="size-8">
					<AvatarImage src={image || ICON_IMG_URL} />
					{name && !image && !isPending && (
						<AvatarFallback>
							{name?.charAt(0)}
						</AvatarFallback>
					)}
				</Avatar>
				<div className="flex-1 grid [&_>_*]:truncate">
					{!mounted || isPending ? (
						<Loader2
							className="size-4 animate-spin duration-200"
							suppressHydrationWarning
						/>
					) : (
						<div className="flex-1 grid [&_>_*]:truncate">
							<span className="font-semibold">
								{name || t("guest")}
							</span>
							<Muted>{email || "(NA)"}</Muted>
						</div>
					)}
				</div>
				<ChevronsUpDown className="ml-auto" />
			</SidebarMenuButton>
		</DropdownMenuTrigger>
	);
}

function FooterDropdownMenuContent() {
	return (
		<DropdownMenuContent className="min-w-2xs sm:min-w-xs bg-popover/40 backdrop-blur-lg">
			{/* Preferences */}
			<PreferencesDropdownMenuGroup />

			{/* Account */}
			<DropdownMenuSeparator />
			<AccountDropdownMenuGroup />
		</DropdownMenuContent>
	);
}

function PreferencesDropdownMenuGroup() {
	const t = useTranslations("chat.sidebar.settings.preferences");
	const { preset, setPreset } = useThemeStore();

	return (
		<DropdownMenuGroup>
			<DropdownMenuLabel>
				<Muted>{t("title")}</Muted>
			</DropdownMenuLabel>

			<DropdownMenuItem className="py-1 cursor-default data-[disabled]:pointer-events-auto data-[disabled]:opacity-100" disabled>
				<Muted><SunMoon /></Muted>
				<span>{t("mode")}</span>
				<ModeToggle className="ml-auto" />
			</DropdownMenuItem>

			<DropdownMenuItem className="py-1 cursor-default data-[disabled]:pointer-events-auto data-[disabled]:opacity-100" disabled>
				<Muted><Palette /></Muted>
				<span>{t("theme")}</span>
				<ThemePresetSelect className="ml-auto w-36 sm:w-42 !h-8" presets={presets} currentPreset={preset} onPresetChange={setPreset} />
			</DropdownMenuItem>

			<DropdownMenuItem className="py-1 cursor-default data-[disabled]:pointer-events-auto data-[disabled]:opacity-100" disabled>
				<Muted><Globe /></Muted>
				<span>{t("lang")}</span>
				<LocaleSelect className="ml-auto w-36 sm:w-42 !h-8" />
			</DropdownMenuItem>
		</DropdownMenuGroup>
	);
}

function AccountDropdownMenuGroup() {
	const t = useTranslations("chat.sidebar.settings.account");
	const { data: session, isPending } = useSession();
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(false);

	return (
		<DropdownMenuGroup>
			<DropdownMenuLabel>
				<Muted>{t("title")}</Muted>
			</DropdownMenuLabel>
			<DropdownMenuItem>
				<Settings2 />
				<span>{t("advanced_settings")}</span>
			</DropdownMenuItem>
			{!isPending && session ? (
				<DropdownMenuItem
					disabled={isPending || isLoading}
					onSelect={async () => {
						setIsLoading(true);
						await signOut({
							fetchOptions: {
								onSuccess: () => {
									router.push("/");
									setIsLoading(false);
								},
								onError: () => setIsLoading(false),
							}
						});
					}}
				>
					{isLoading ? <Loader2 className="animate-spin duration-200" /> : <LogOut className="text-destructive" />}
					<span className="text-destructive">{t("sign_out")}</span>
				</DropdownMenuItem>
			) : (
				<DropdownMenuItem asChild>
					<Link href="/signin">
						<Muted><LogIn /></Muted>
						<span>{t("sign_in")}</span>
					</Link>
				</DropdownMenuItem>
			)}
		</DropdownMenuGroup>
	);
}