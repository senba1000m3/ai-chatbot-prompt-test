"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { type PromptStoreProps } from "../../../../../lib/store/prompt";
import { useNicknameStore, type TestArea } from "../../../../../lib/store/prompt-login";
import { nanoid } from "nanoid";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";
import { cn } from "../../../../../lib/utils";

// Components & UI
import { TestDataTable } from "../../../../../components/test-data-table";
import { CreateTestDataDialog } from "../../../../../components/create-test-data-dialog";

import { toast } from "sonner";
import { Button } from "../../../../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../../../../components/ui/card";
import { H1, Muted } from "../../../../../components/common/typography";
import { WrapperLayout } from "../../../../../components/common/layouts";

// Icons & Images
import {
	Copy,
	Download,
	ExternalLink,
	Plus,
	Trash2,
	User,
} from "lucide-react";

// Types & Interfaces



export default function DashboardPage() {
	const router = useRouter();

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const {testAreas, addTestArea, deleteTestArea, duplicateTestArea, getTestArea, setNowTestAreaId, loadPromptBackup} = useNicknameStore();

	// Get nickname from zustand and load test areas
	useEffect(() => {
		const nickname = useNicknameStore.getState().nickname;
		if (!nickname) {
			router.push("/tools/chat-prompt");
			return;
		}
	}, [router]);

	// 創建新產線
	const handleCreateTestArea = (testArea: TestArea) => {
		try {
			const newTestArea = addTestArea(testArea);
			if (!newTestArea) throw new Error();
			toast("創建成功", { description: `產線 \"${newTestArea.name}\" 已創建` });
			setIsDialogOpen(false);
			setNowTestAreaId(newTestArea.id);
			console.log(newTestArea.data);
			loadPromptBackup(newTestArea.data);
			router.push(`assembly/${newTestArea.id}`);
		} catch (error) {
			console.error("創建產線失敗:", error);
			toast.error("創建失敗", { description: "無法創建新產線" });
		}
	};

	// 刪除產線
	const handleDeleteTestArea = (id: string) => {
		try {
			deleteTestArea(id);
			toast("刪除成功", { description: "產線已刪除" });
		} catch (error) {
			console.error("刪除產線失敗:", error);
			toast("刪除失敗", { description: "無法刪除產線" });
		}
	};

	// 複製產線
	const handleDuplicateTestArea = (id: string) => {
		try {
			const duplicatedArea = duplicateTestArea(id);
			if (!duplicatedArea) throw new Error();
			toast("複製成功", { description: `產線 \"${duplicatedArea.name}\" 已創建` });
		} catch (error) {
			console.error("複製產線失敗:", error);
			toast.error("複製失敗", { description: "無法複製產線" });
		}
	};

	// 下載產線數據
	const handleDownloadTestArea = (id: string) => {
		try {
			const area = getTestArea(id);
			if (!area) throw new Error("產線數據不存在");
			const blob = new Blob([JSON.stringify(area, null, 2)], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `ocr-test-area-${area.name}-${new Date().toISOString().slice(0, 10)}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			toast("下載成功", { description: "產線數據已下載" });
		} catch (error) {
			console.error("下載產線失敗:", error);
			toast.error("下載失敗", { description: "無法下載產線數據" });
		}
	};

	// 打開產線
	const handleOpenTestArea = (id: string) => {
		setNowTestAreaId(id);
		const oldBackup = (testAreas.find(area => area.id === id)?.data || {} as PromptStoreProps);
		loadPromptBackup(oldBackup);
		router.push(`assembly/${id}`);
	}

	return (
		<WrapperLayout className="py-8">
		<DashboardHeader className="mb-6">
		<Button className="w-fit" onClick={() => setIsDialogOpen(true)}>
	<Plus />
	新增產線
	</Button>
	</DashboardHeader>

	<Card>
	<CardHeader>
		<CardTitle>產線列表</CardTitle>
	<CardDescription>管理您的 OCR 產線</CardDescription>
	</CardHeader>
	<CardContent>
	{testAreas.length === 0 ? (
			<div className="text-center py-8 text-muted-foreground">
			<p className="mb-4">您還沒有創建任何產線</p>
				<Button onClick={() => setIsDialogOpen(true)}>
	<Plus />
	創建第一個產線
	</Button>
	</div>
) : (
		<TestDataTable
			data={testAreas.map((area) => ({
				id: area.id,
				name: area.name,
				updatedAt: formatDistanceToNow(new Date(area.updatedAt), {
					addSuffix: true,
					locale: zhTW,
				}),
				author: area.author,
				actions: (
					<div className="flex items-center gap-2">
						<Button variant="ghost" size="icon" onClick={() => handleDuplicateTestArea(area.id)}>
							<Copy />
						</Button>
						<Button variant="ghost" size="icon" onClick={() => handleDownloadTestArea(area.id)}>
							<Download />
						</Button>
						<Button variant="ghost" size="icon" onClick={() => handleDeleteTestArea(area.id)}>
							<Trash2 />
						</Button>
					</div>
				),
}))}
	onRowClick={(id) => handleOpenTestArea(id)}
	/>
)}
	</CardContent>
	</Card>

	<CreateTestDataDialog
		open={isDialogOpen}
		onOpenChange={setIsDialogOpen}
		onSubmit={handleCreateTestArea}
	/>
	</WrapperLayout>
)
}

function DashboardHeader({ className, children }: React.ComponentProps<"header">) {
	const nickname = useNicknameStore(state => state.nickname);

	return (
		<header className={cn("self-center flex max-sm:flex-col sm:items-center justify-between gap-2 w-full h-min", className)}>
	<div>
		<H1>TAI 工廠</H1>
	<Muted className="flex items-center gap-1">
	<User className="inline size-4" />
		歡迎，{nickname}
	<ChangeNickNameButton />
	</Muted>
	</div>
	{children}
	</header>
);
}

function ChangeNickNameButton() {
	const router = useRouter();
	const setNickname = useNicknameStore(state => state.setNickname);

	function handleClick() {
		setNickname("");
		router.push("/tools/chat-prompt");
	}

	return (
		<Button
			variant="link"
	size="sm"
	className="p-0"
	onClick={handleClick}
		>
		(更換暱稱)
		</Button>
);
}

