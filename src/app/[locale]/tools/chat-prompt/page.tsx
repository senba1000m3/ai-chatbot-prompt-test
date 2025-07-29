"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLoginStore } from "@/lib/store/prompt-login";

// Components & UI
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Icons & Images
import { Loader2 } from "lucide-react";

// Constants & Variables
const DASHBOARD_URL = "chat-prompt/dashboard";



export default function HomePage() {
	const router = useRouter();

	const { nickname, setNickname } = useLoginStore();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isSuccess, setIsSuccess] = useState<boolean>(false);

	const INPUT_ID = "nickname";

	useEffect(() => {
		if (nickname) {
			toast.info("您已設定過暱稱", {
				description: `${nickname}，歡迎來到 TAI 工廠`,
				duration: 1500,
				onAutoClose: () => router.push(DASHBOARD_URL),
				onDismiss: () => router.push(DASHBOARD_URL),
			});
		}
	}, [nickname, router]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setIsLoading(true);
		const formData = new FormData(e.currentTarget as HTMLFormElement);
		const name = (formData.get(INPUT_ID) as string).trim();

		if (!name) {
			toast.error("請輸入暱稱", { description: "暱稱不能為空" });
			return;
		}

		try {
			setNickname(name);
			setIsSuccess(true);
			toast.success("暱稱設定成功", {
				description: `${name}，歡迎來到 TAI 工廠`,
			});
			router.push(DASHBOARD_URL);
		} catch (error: any) {
			console.error("NICKNAME::ERR:", error.message);
			toast.error("暱稱設定失敗", { description: "無法設定暱稱，請重試" });
			setIsLoading(false);
		}
	}

	return (
		<main className="flex flex-col items-center justify-center h-[calc(100svh_-_3.5rem)] p-4 md:p-8">
			<Card className="w-full max-w-lg">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">TAI 工廠</CardTitle>
					<CardDescription>歡迎來到 TAI 工廠，你可以在這裡進行聊天機器人的開發與測試。</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="grid gap-2">
							<Label htmlFor={INPUT_ID}>請輸入您的暱稱</Label>
							<Input
								id={INPUT_ID}
								name={INPUT_ID}
								type="text"
								placeholder="例如：里莫"
								disabled={isLoading}
								maxLength={20}
							/>
						</div>
						<Button
							type="submit"
							className="w-full"
							disabled={isLoading || !!nickname}
						>
							{isSuccess
								? "即將跳轉..." : isLoading
									? <Loader2 className="animate-spin" />
									: "開始使用"
							}
						</Button>
					</form>
				</CardContent>
			</Card>
		</main>
	);
}