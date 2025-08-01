"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { type PromptStoreProps } from "../../../../../lib/store/prompt";
import { usePromptStore } from "../../../../../lib/store/prompt";
import { useLoginStore, type TestArea } from "../../../../../lib/store/prompt-login";
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
	Plus,
	Trash2,
	User,
	Upload,
	Pencil,
} from "lucide-react";

// Types & Interfaces



export default function DashboardPage() {
	const router = useRouter();

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const {nickname, testAreas, addTestArea, addOldTestArea, deleteTestArea, duplicateTestArea, getTestArea, setNowTestAreaId, loadPromptBackup, setPromptBackup} = useLoginStore();
	const promptStore = usePromptStore();

	// 只負責判斷 nickname
	useEffect(() => {
		if (!nickname) {
			router.push("/tools/chat-prompt");
		}
	}, [router, nickname]);

	// 專門判斷 testAreas 與 promptStore，建立預設產線
	useEffect(() => {
		const hasPromptData = promptStore && promptStore.systemPrompt && promptStore.hintMessage && promptStore.parameters;
		if (testAreas.length === 0 && hasPromptData && nickname) {
			const tmpId = nanoid();
			const defaultTestArea = {
				id: tmpId,
				name: "未儲存產線",
				author: nickname,
				updatedAt: new Date().toISOString(),
				data: {},
			};
			addTestArea(defaultTestArea);
			setNowTestAreaId(tmpId);
			router.push(`assembly/${tmpId}`);
		}
	}, [testAreas.length, promptStore.systemPrompt, promptStore.hintMessage, promptStore.parameters]);

	// 創建新產線
	const handleCreateTestArea = (testArea: TestArea) => {
		try {
			const newTestArea = addTestArea(testArea);
			if (!newTestArea) throw new Error();
			toast("創建成功", { description: `產線 \"${newTestArea.name}\" 已創建` });
			setIsDialogOpen(false);
			setNowTestAreaId(newTestArea.id);
			// console.log(newTestArea.data);
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

	// 上傳產線數據
	const handleUploadTestArea = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		try {
			const text = await file.text();
			const area = JSON.parse(text);
			if (!area || !area.id || !area.name || !area.data) throw new Error("格式錯誤");
			// 檢查 id 是否已存在，若存在則給新 id
			let newArea = { ...area };
			if (testAreas.some(a => a.id === area.id)) {
				newArea = { ...area, id: nanoid(), name: area.name + " (匯入)" };
			}

			const added = addOldTestArea({ ...newArea, data: area.data });
			if (!added) throw new Error();
			toast("上傳成功", { description: `產線 \"${newArea.name}\" 已匯入` });
		} catch (error) {
			console.error("上傳產線失敗:", error);
			toast.error("上傳失敗", { description: "無法匯入產線，請確認檔案格式正確" });
		} finally {
			// 清空 input value 以便可重複上傳同一檔案
			e.target.value = "";
		}
	};

	// 打開產線
	const handleOpenTestArea = (id: string) => {
		setNowTestAreaId(id);
		const oldBackup = (testAreas.find(area => area.id === id)?.data || {} as PromptStoreProps);
		loadPromptBackup(oldBackup);
		router.push(`assembly/${id}`);
	}

	// 改名產線
	const handleRenameTestArea = (id: string, oldName: string) => {
		const newName = prompt("請輸入新的產線名稱：", oldName);
		if (!newName || newName.trim() === oldName) return;
		try {
			const updated = testAreas.map(area =>
				area.id === id ? { ...area, name: newName.trim(), updatedAt: new Date().toISOString() } : area
			);
			useLoginStore.setState({ testAreas: updated });
			toast("名稱已更新", { description: `產線名稱已改為 \"${newName.trim()}\"` });
		} catch (error) {
			toast.error("改名失敗", { description: "無法更改產線名稱" });
		}
	};

	return (
		<WrapperLayout className="py-8">
		<DashboardHeader className="mb-6">
			<div className="flex gap-3">
				<Button className="w-fit" onClick={() => setIsDialogOpen(true)}>
					<Plus />
					新增產線
				</Button>
				<Button className="w-fit" variant="secondary">
					<label htmlFor="upload-test-area-json" className="cursor-pointer flex items-center">
						<Upload className="mr-1" /> 上傳產線
						<input
							id="upload-test-area-json"
							type="file"
							accept="application/json"
							className="hidden"
							onChange={handleUploadTestArea}
						/>
					</label>
				</Button>
			</div>
		</DashboardHeader>

	<Card>
	<CardHeader>
		<div className="flex items-center justify-between">
			<div className="gap-2 flex flex-col">
				<CardTitle>產線列表</CardTitle>
				<CardDescription>管理您 Prompt 工廠的所有產線</CardDescription>
			</div>
		</div>
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
						<Button variant="ghost" size="icon" onClick={() => handleRenameTestArea(area.id, area.name)}>
							<Pencil />
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
	const nickname = useLoginStore(state => state.nickname);

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
	const setNickname = useLoginStore(state => state.setNickname);

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

