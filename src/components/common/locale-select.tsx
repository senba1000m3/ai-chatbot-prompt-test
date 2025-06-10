"use client";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { routing } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";

// Components & UI
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransition } from "react";



export function LocaleSelect({ className }: React.ComponentProps<typeof SelectTrigger>) {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams();

	const t = useTranslations("common.locales");
	const locale = useLocale();
	const [isPending, startTransition] = useTransition();


	function handleValueChange(nextLocale: string) {
		startTransition(() => {
			router.replace(
				// @ts-expect-error -- TypeScript will validate that only known `params`
				// are used in combination with a given `pathname`. Since the two will
				// always match for the current route, we can skip runtime checks.
				{ pathname, params },
				{ locale: nextLocale },
			);
		});
	}

	return (
		<Select
			defaultValue={locale}
			onValueChange={handleValueChange}
			disabled={isPending}
		>
			<SelectTrigger className={cn("h-8", className)}>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{routing.locales.map(locale => (
					<SelectItem key={locale} value={locale}>
						{t(locale) || locale.toUpperCase()}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}