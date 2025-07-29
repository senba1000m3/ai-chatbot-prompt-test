"use client"
import { useCallback, useEffect, useState } from "react";
// import Papa from "papaparse";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Textarea } from "@/components/ui/textarea";
import { Muted } from "./common/typography"
import { useLoginStore } from "@/lib/store/prompt-login";

// Icons & Images
// import { Upload } from "lucide-react";

// Types & Interfaces
import type { TestArea } from "@/lib/store/prompt-login";

interface CreateTestDataDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: TestArea) => void;
}

// Constants & Variables
const DEFAULT_EXAMPLES = [
	{
		name: "數學理論推導",
		text: "暫無內容",
		defaultHintMessage: ["請幫我分析這個問題", "能否提供更詳細的說明？"]
	},
	{
		name: "聊天貼圖測試",
		text: "暫無內容",
		defaultHintMessage: ["跟我說說你現在的心情如何？", "你看到這個的心情如何？"]
	}
];



export function CreateTestDataDialog({ open, onOpenChange, onSubmit }: CreateTestDataDialogProps) {
	const [activeTab, setActiveTab] = useState("examples");
	const [isLoading, setIsLoading] = useState(false);
	const [testAreaName, setTestAreaName] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [groundTruth, setGroundTruth] = useState("");

	// CSV 相關狀態
	const [csvData, setCsvData] = useState<any[]>([]);
	const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
	const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);

	const { setDefaultHintMessage } = useLoginStore();

	// 處理選擇 CSV 行
	const handleSelectCsvRow = useCallback(() => {
		if (selectedRowIndex === null || !csvData[selectedRowIndex]) {
			toast("未選擇數據", { description: "請選擇一行數據" });
			return;
		}

		const selectedRow = csvData[selectedRowIndex]
		const rowImageUrl = selectedRow.imageUrl || selectedRow.image_url || selectedRow.url || ""
		const rowText =
			selectedRow.text || selectedRow.groundTruth || selectedRow.ground_truth || selectedRow.expected || ""
		const rowName = selectedRow.name || `產線 ${new Date().toLocaleString()}`

		if (rowImageUrl && rowText) {
			setImageUrl(rowImageUrl)
			setGroundTruth(rowText)
			setTestAreaName(rowName)
			setIsCsvDialogOpen(false)
			toast("CSV 數據已選擇", { description: `已選擇第 ${selectedRowIndex + 1} 行數據` });
		} else {
			toast("無效的數據", { description: "選擇的行缺少圖片 URL 或文本" });
		}
	}, [csvData, selectedRowIndex, setImageUrl, setGroundTruth, setTestAreaName, setIsCsvDialogOpen, toast])

	// 重置表單
	useEffect(() => {
		if (open) {
			setTestAreaName("")
			setImageUrl("")
			setGroundTruth("")
			setActiveTab("examples")
			setSelectedRowIndex(null)
			setCsvData([])
		}
	}, [open])

	// 處理表單提交
	const handleSubmit = () => {
		if (!testAreaName.trim()) {
			//   toast({
			//     title: "請輸入名稱",
			//     description: "產線名稱不能為空",
			//     variant: "destructive",
			//   })
			return
		}

		onSubmit({
			name: testAreaName,
		})
	}

	const handleDefaultExample = (index: number) => {
		const example = DEFAULT_EXAMPLES[index]

		setTestAreaName(example.name)
		setGroundTruth(example.text);
		setDefaultHintMessage(example.defaultHintMessage);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>創建新產線</DialogTitle>
					<DialogDescription>創建一個新的聊天機器人研發產線，用於測試和比較不同模型的 Prompt 與參數。</DialogDescription>
				</DialogHeader>

				<ScrollArea className="py-4 max-h-[60svh]">
					<div className="space-y-2 mb-4">
						<Label htmlFor="test-area-name">產線名稱</Label>
						<Input
							id="test-area-name"
							placeholder="輸入產線名稱"
							value={testAreaName}
							onChange={(e) => setTestAreaName(e.target.value)}
						/>
					</div>

					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="examples">預設範例</TabsTrigger>
							<TabsTrigger value="manual">手動輸入</TabsTrigger>
							<TabsTrigger value="upload">上傳文件</TabsTrigger>
						</TabsList>

						{/* 預設範例 */}
						<TabsContent value="examples" className="space-y-4 py-2">
							<div className="grid gap-2">
								{DEFAULT_EXAMPLES.map((example, index) => (
									<Button
										key={index}
										variant="outline"
										className="justify-start h-auto py-3 px-4"
										onClick={() => handleDefaultExample(index)}
									>
										<div className="grid text-start">
											<span className="font-medium text-base">{example.name}</span>
											<Muted className="truncate">{example.text}</Muted>
										</div>
									</Button>
								))}
							</div>
						</TabsContent>

						{/* 手動輸入 */}
						<TabsContent value="manual" className="space-y-4 py-2">
							{/* <div className="space-y-2">
								<Label htmlFor="image-url">圖片 URL 或 Base64</Label>
								<Input
									id="image-url"
									placeholder="輸入圖片 URL 或粘貼 base64 數據"
									value={imageUrl}
									onChange={(e) => setImageUrl(e.target.value)}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="ground-truth">預期 OCR 文本</Label>
								<Textarea
									id="ground-truth"
									placeholder="輸入預期的 OCR 文本輸出..."
									value={groundTruth}
									onChange={(e) => setGroundTruth(e.target.value)}
									rows={6}
								/>
							</div> */}
							<p className="text-center">暫時隱藏</p>
						</TabsContent>

						{/* 上傳文件 */}
						<TabsContent value="upload" className="space-y-4 py-2">
							{/* <div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label className="mb-2 block">上傳圖片</Label>
										<Button variant="outline" className="w-full" asChild disabled={isLoading}>
											<label>
												<Upload className="h-4 w-4 mr-2" />
												{isLoading ? "處理中..." : "選擇圖片文件"}
												<input
													type="file"
													className="hidden"
													accept="image/*"
													onChange={handleFileUpload}
													disabled={isLoading}
												/>
											</label>
										</Button>
									</div>

									<div>
										<Label className="mb-2 block">上傳 CSV</Label>
										<Button variant="outline" className="w-full" asChild disabled={isLoading}>
											<label>
												<Upload className="h-4 w-4 mr-2" />
												{isLoading ? "處理中..." : "選擇 CSV 文件"}
												<input
													type="file"
													className="hidden"
													accept=".csv"
													onChange={handleCsvUpload}
													disabled={isLoading}
												/>
											</label>
										</Button>
									</div>
								</div>

								<div className="text-xs text-muted-foreground">
									CSV 文件應包含 imageUrl 和 text 列。將使用第一行數據。
								</div>
							</div> */}
							<p className="text-center">暫時隱藏</p>
						</TabsContent>
					</Tabs>

					{imageUrl && (
						<div className="mt-4">
							<Label className="mb-2 block">圖片預覽</Label>
						</div>
					)}
				</ScrollArea>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						取消
					</Button>
					<Button onClick={handleSubmit}>創建產線</Button>
				</DialogFooter>
			</DialogContent>

			{/* CSV 數據選擇對話框 */}
			<Dialog open={isCsvDialogOpen} onOpenChange={setIsCsvDialogOpen}>
				<DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
					<DialogHeader>
						<DialogTitle>選擇 CSV 數據行</DialogTitle>
						<DialogDescription>請選擇要用於測試的數據行</DialogDescription>
					</DialogHeader>

					<div className="flex-1 overflow-auto my-4">
						{csvData.length > 0 ? (
							<div className="space-y-4">
								<RadioGroup
									value={selectedRowIndex !== null ? selectedRowIndex.toString() : undefined}
									onValueChange={(value) => setSelectedRowIndex(Number.parseInt(value))}
								>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className="w-[50px]">選擇</TableHead>
												<TableHead>行號</TableHead>
												<TableHead>圖片 URL</TableHead>
												<TableHead>文本</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{csvData.map((row, index) => {
												const imageUrl = row.imageUrl || row.image_url || row.url || ""
												const text = row.text || row.groundTruth || row.ground_truth || row.expected || ""

												return (
													<TableRow key={index} className={selectedRowIndex === index ? "bg-muted/50" : ""}>
														<TableCell>
															<RadioGroupItem value={index.toString()} id={`row-${index}`} />
														</TableCell>
														<TableCell>{index + 1}</TableCell>
														<TableCell className="max-w-[300px] truncate">{imageUrl}</TableCell>
														<TableCell className="max-w-[300px] truncate">{text}</TableCell>
													</TableRow>
												)
											})}
										</TableBody>
									</Table>
								</RadioGroup>
							</div>
						) : (
							<div className="text-center py-8 text-muted-foreground">沒有 CSV 數據可顯示</div>
						)}
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setIsCsvDialogOpen(false)}>
							取消
						</Button>
						<Button onClick={handleSelectCsvRow} disabled={selectedRowIndex === null}>
							使用選中的數據
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Dialog>
	)
}