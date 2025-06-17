"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

// Auth
import { signIn, useSession } from "@/lib/auth/client";

// Components & UI
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { P } from "@/components/common/typography";
import { WrapperLayout } from "@/components/common/layouts";



export default function SignInPage() {
	return (
		<Suspense>
			<SignInPageSuspenseContent />
		</Suspense>
	);
}

function SignInPageSuspenseContent() {
	const { data: session, isPending } = useSession();
	const t = useTranslations();

	const router = useRouter();
	const searchParams = useSearchParams();
	const error = searchParams.get("error");

	useEffect(() => {
		router.prefetch("/chat");
	}, [router]);

	// Redirect to `/chat` if user is already signed in
	useEffect(() => {
		if (session) {
			toast.info(t("signin.already"), {
				duration: 2000,
				onAutoClose: () => router.push("/chat"),
				onDismiss: () => router.push("/chat"),
			});
		}
	}, [session, router, t]);

	// Resolve error message
	useEffect(() => {
		if (error) {
			router.replace("/signin");
			toast.error(
				t("toast.error_title"),
				{ description: error }
			);
		}
	}, [error, router, t]);

	return (
		<WrapperLayout className="grid h-svh">
			<header className="place-self-center grid justify-items-center gap-6">
				<Button
					size="lg"
					className="btn-chrome"
					onClick={async () => signIn.social({
						provider: "google",
						callbackURL: "/chat",
						errorCallbackURL: "/signin",
					})}
					disabled={isPending || !!session}
				>
					<span>{t("signin.by_provider", { provider: "Google" })}</span>
				</Button>
				{/* <Anchor
					href="/chat"
					className="text-muted-foreground"
				>
					{t("signin.or")}
				</Anchor> */}
				<P>{t("signin.will_delete")}</P>
			</header>
		</WrapperLayout>
	);
}