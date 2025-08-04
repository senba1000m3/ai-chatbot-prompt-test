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
import { Textarea } from "@/components/ui/textarea";
import { Muted } from "./common/typography"
import { useLoginStore } from "@/lib/store/prompt-login";
import { nanoid } from "nanoid";
import { cn } from "@/lib/utils";

// Icons & Images
import { X } from "lucide-react";

// Types & Interfaces
import { type TestArea } from "@/lib/store/prompt-login";
import { type TestMessageSet} from "@/lib/store/advanced";

interface ManualRatingCategory {
	name: string;
	rubrics: string[];
}

interface CreateTestDataDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: TestArea) => void;
}

type DefaultExample = (typeof DEFAULT_EXAMPLES)[number];

// Constants & Variables
const DEFAULT_EXAMPLES = [
	{
		name: "數學理論推導",
		text: "暫無內容",
		defaultHintMessage: ["請幫我分析這個問題", "能否提供更詳細的說明？"],
		defaultTestMessageDatasets: [
			{
				name: "基本問題",
				messages: [
					{ message: "請問怎麼積分x^3", require: "答案是 1/4x^4，但 ai 不應該寫出這樣完整的表達式，ai 需要提供引導，而不是給出答案。" },
					{ message: "sin(pi/2)", require: "1" },
				]
			}
		],
		defaultRatingCategories: [
            {
                name: "基本題",
                rubrics: [
                    "ＡＩ回答的回答就是我要問的問題",
                    "摘要時沒有將最終答案顯示出來",
                    "計算是正確的",
                    "回答的段落跟設定相同",
                    "數學的格式正確顯示",
                    "不會一直跳針，重複類似的句子"
                ]
            },
            {
                name: "易用性",
                rubrics: [
                    "我不用花費辛勞就能得到解題引導",
                    "使用這個情境時我感受到輕鬆自在"
                ]
            },
            {
                name: "接受、同理度",
                rubrics: [
                    "我看得懂這個ＡＩ助教給的答案",
                    "整體而言我可以接受這樣的推導方法",
                    "我可以接受這樣的回答段落順序",
                    "我可以接受這樣的錯誤率"
                ]
            },
            {
                name: "有用、幫助感",
                rubrics: [
                    "這樣的回答對我學習計算有幫助",
                    "這樣的協助比我自己計算還快速",
                    "這樣的協助能讓我更理解計算過程",
                    "以學習而言比其他ＡＩ聊天機器人好用"
                ]
            },
            {
                name: "使用意圖",
                rubrics: [
                    "我以後會繼續使用這個情境來幫助我解決推導問題"
                ]
            },
            {
                name: "使用體驗",
                rubrics: [
                    "我覺得模型回覆花費的時間很快速"
                ]
            }
        ]
	},
	{
		name: "聊天貼圖測試",
		text: "暫無內容",
		defaultHintMessage: ["跟我說說你現在的心情如何？", "你看到這個的心情如何？"],
		defaultTestMessageDatasets: [],
		defaultRatingCategories: []
	}
];



export function CreateTestDataDialog({ open, onOpenChange, onSubmit }: CreateTestDataDialogProps) {
	const [activeTab, setActiveTab] = useState("examples");
	const [isLoading, setIsLoading] = useState(false);
	const [testAreaName, setTestAreaName] = useState("");
	const [nameError, setNameError] = useState(false);
	const [imageUrl, setImageUrl] = useState("");
	const [groundTruth, setGroundTruth] = useState("");
	const [selectedExample, setSelectedExample] = useState<DefaultExample | null>(null);

	// 手動輸入狀態
	const [manualHintMessages, setManualHintMessages] = useState("");
	const [manualTestDatasets, setManualTestDatasets] = useState<TestMessageSet[]>([]);
	const [manualRatingCategories, setManualRatingCategories] = useState<ManualRatingCategory[]>([]);

	// CSV 相關狀態
	const [csvData, setCsvData] = useState<any[]>([]);
	const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
	const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);

	const { setDefaultHintMessage, setDefaultRatingCategories, setDefaultTestMessageDatasets } = useLoginStore();

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
			setSelectedExample(null)
			setManualHintMessages("")
			setManualTestDatasets([])
			setManualRatingCategories([])
			setNameError(false);
		}
	}, [open])

	// 處理表單提交
	const handleSubmit = () => {
		if (!testAreaName.trim()) {
			setNameError(true);
			toast.error("產線名稱不能為空");
			return
		}

		if (activeTab === 'manual') {
			const hintMessages = manualHintMessages.split('\n').filter(line => line.trim() !== '');
			setDefaultHintMessage(hintMessages);
			// Manually cast the type to match what the store expects.
			const datasetsForStore = manualTestDatasets.map(d => ({
				name: d.name,
				messages: d.messages.map(m => ({
					message: m.message,
					require: m.require,
				}))
			}));
			setDefaultTestMessageDatasets(datasetsForStore);

			const categoriesForStore = manualRatingCategories.map(c => ({
				name: c.name,
				rubrics: c.rubrics.map(r => r) // Ensure it's a new array of strings
			}));
			setDefaultRatingCategories(categoriesForStore);
		}

		onSubmit({
			name: testAreaName,
		})
	}

	const handleDefaultExample = (index: number) => {
		const example = DEFAULT_EXAMPLES[index]
		setSelectedExample(example);

		setTestAreaName(example.name)
		setGroundTruth(example.text);
		if (example.defaultHintMessage) {
			setDefaultHintMessage(example.defaultHintMessage);
		}
		if (example.defaultRatingCategories) {
			setDefaultRatingCategories(example.defaultRatingCategories);
		}
		if (example.defaultTestMessageDatasets) {
			setDefaultTestMessageDatasets(example.defaultTestMessageDatasets);
		}
	}

	// 手動輸入處理函數
	const handleAddDataset = () => {
		setManualTestDatasets([...manualTestDatasets, { id: nanoid(), name: '', messages: [{ id: nanoid(), message: '', require: '' }] }]);
	};

	const handleRemoveDataset = (index: number) => {
		setManualTestDatasets(manualTestDatasets.filter((_, i) => i !== index));
	};

	const handleDatasetChange = (index: number, field: 'name', value: string) => {
		const newDatasets = manualTestDatasets.map((dataset, i) => {
			if (i === index) {
				return { ...dataset, [field]: value };
			}
			return dataset;
		});
		setManualTestDatasets(newDatasets);
	};

	const handleAddMessage = (datasetIndex: number) => {
		const newDatasets = manualTestDatasets.map((dataset, i) => {
			if (i === datasetIndex) {
				return { ...dataset, messages: [...dataset.messages, { id: nanoid(), message: '', require: '' }] };
			}
			return dataset;
		});
		setManualTestDatasets(newDatasets);
	};

	const handleRemoveMessage = (datasetIndex: number, messageIndex: number) => {
		const newDatasets = manualTestDatasets.map((dataset, i) => {
			if (i === datasetIndex) {
				return { ...dataset, messages: dataset.messages.filter((_, j) => j !== messageIndex) };
			}
			return dataset;
		});
		setManualTestDatasets(newDatasets);
	};

	const handleMessageChange = (datasetIndex: number, messageIndex: number, field: 'message' | 'require', value: string) => {
		const newDatasets = manualTestDatasets.map((dataset, i) => {
			if (i === datasetIndex) {
				const newMessages = dataset.messages.map((message, j) => {
					if (j === messageIndex) {
						return { ...message, [field]: value };
					}
					return message;
				});
				return { ...dataset, messages: newMessages };
			}
			return dataset;
		});
		setManualTestDatasets(newDatasets);
	};

	const handleAddCategory = () => {
		setManualRatingCategories([...manualRatingCategories, { name: '', rubrics: [''] }]);
	};

	const handleRemoveCategory = (index: number) => {
		setManualRatingCategories(manualRatingCategories.filter((_, i) => i !== index));
	};

	const handleCategoryChange = (index: number, value: string) => {
		const newCategories = manualRatingCategories.map((category, i) => {
			if (i === index) {
				return { ...category, name: value };
			}
			return category;
		});
		setManualRatingCategories(newCategories);
	};

	const handleAddRubric = (categoryIndex: number) => {
		const newCategories = manualRatingCategories.map((category, i) => {
			if (i === categoryIndex) {
				return { ...category, rubrics: [...category.rubrics, ''] };
			}
			return category;
		});
		setManualRatingCategories(newCategories);
	};

	const handleRemoveRubric = (categoryIndex: number, rubricIndex: number) => {
		const newCategories = manualRatingCategories.map((category, i) => {
			if (i === categoryIndex) {
				return { ...category, rubrics: category.rubrics.filter((_, j) => j !== rubricIndex) };
			}
			return category;
		});
		setManualRatingCategories(newCategories);
	};

	const handleRubricChange = (categoryIndex: number, rubricIndex: number, value: string) => {
		const newCategories = manualRatingCategories.map((category, i) => {
			if (i === categoryIndex) {
				const newRubrics = category.rubrics.map((rubric, j) => {
					if (j === rubricIndex) {
						return value;
					}
					return rubric;
				});
				return { ...category, rubrics: newRubrics };
			}
			return category;
		});
		setManualRatingCategories(newCategories);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="min-w-6xl grid grid-cols-2 gap-8 p-0">
				{/* Left Column */}
				<div className="flex flex-col h-full">
					<DialogHeader className="p-6 pb-4">
						<DialogTitle className="text-2xl">創建新產線</DialogTitle>
						<DialogDescription>創建一個新的聊天機器人研發產線，用於測試和比較不同模型的 Prompt 與參數。</DialogDescription>
					</DialogHeader>
					<div className="px-6 py-4 flex-1 min-h-0">
						<div className="space-y-2 mb-4">
							<Label htmlFor="test-area-name">產線名稱</Label>
							<Input
								id="test-area-name"
								placeholder="輸入產線名稱"
								value={testAreaName}
								onChange={(e) => {
									setTestAreaName(e.target.value)
									if (nameError) {
										setNameError(false)
									}
								}}
								className={cn(nameError && "border-red-500 focus-visible:ring-red-500")}
							/>
							{nameError && <p className="text-sm text-red-500 mt-1">產線名稱不能為空</p>}
						</div>

						<Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="examples">預設範例</TabsTrigger>
								<TabsTrigger value="manual">手動輸入</TabsTrigger>
								{/*<TabsTrigger value="upload">上傳文件</TabsTrigger>*/}
							</TabsList>

							<div className="mt-2 w-full">
								<TabsContent value="examples" className="space-y-4 mt-2 h-[calc(70vh-270px)] overflow-y-auto">
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
								<TabsContent value="manual" className="space-y-4 py-2 mt-2 h-[calc(70vh-270px)] overflow-y-auto">
									<div className="space-y-2">
										<Label htmlFor="manual-hint-messages">提示訊息 (每行一則)</Label>
										<Textarea
											id="manual-hint-messages"
											placeholder="請幫我分析這個問題&#x0a;能否提供更詳細的說明？"
											value={manualHintMessages}
											onChange={(e) => setManualHintMessages(e.target.value)}
											rows={3}
										/>
									</div>
									{/* 預設測試集 */}
									<div className="space-y-4">
										<Label>預設測試集</Label>
										{manualTestDatasets.map((dataset, datasetIndex) => (
											<div key={datasetIndex} className="p-4 border rounded-md space-y-4">
												<div className="flex justify-between items-center">
													<Label>測試集 #{datasetIndex + 1}</Label>
													<Button variant="ghost" size="icon" onClick={() => handleRemoveDataset(datasetIndex)}>
														<X className="h-4 w-4" />
													</Button>
												</div>
												<div className="space-y-2">
													<Label htmlFor={`dataset-name-${datasetIndex}`}>名稱</Label>
													<Input
														id={`dataset-name-${datasetIndex}`}
														value={dataset.name}
														onChange={(e) => handleDatasetChange(datasetIndex, 'name', e.target.value)}
														placeholder="測試集名稱"
													/>
												</div>
												{dataset.messages.map((message, messageIndex) => (
													<div key={messageIndex} className="p-3 border rounded-md space-y-2">
														<div className="flex justify-between items-center">
															<Label>訊息 #{messageIndex + 1}</Label>
															<Button variant="ghost" size="icon" onClick={() => handleRemoveMessage(datasetIndex, messageIndex)}>
																<X className="h-4 w-4" />
															</Button>
														</div>
														<Input
															value={message.message}
															onChange={(e) => handleMessageChange(datasetIndex, messageIndex, 'message', e.target.value)}
															placeholder="訊息"
														/>
														<Input
															value={message.require}
															onChange={(e) => handleMessageChange(datasetIndex, messageIndex, 'require', e.target.value)}
															placeholder="要求"
														/>
													</div>
												))}
												<Button variant="outline" onClick={() => handleAddMessage(datasetIndex)}>新增訊息</Button>
											</div>
										))}
										<Button onClick={handleAddDataset}>新增測試集</Button>
									</div>
									{/* 預設評分項目 */}
									<div className="space-y-4">
										<Label>預設評分項目</Label>
										{manualRatingCategories.map((category, categoryIndex) => (
											<div key={categoryIndex} className="p-4 border rounded-md space-y-4">
												<div className="flex justify-between items-center">
													<Label>評分項目 #{categoryIndex + 1}</Label>
													<Button variant="ghost" size="icon" onClick={() => handleRemoveCategory(categoryIndex)}>
														<X className="h-4 w-4" />
													</Button>
												</div>
												<div className="space-y-2">
													<Label htmlFor={`category-name-${categoryIndex}`}>名稱</Label>
													<Input
														id={`category-name-${categoryIndex}`}
														value={category.name}
														onChange={(e) => handleCategoryChange(categoryIndex, e.target.value)}
														placeholder="評分項目名稱"
													/>
												</div>
												{category.rubrics.map((rubric, rubricIndex) => (
													<div key={rubricIndex} className="flex items-center gap-2">
														<Input
															value={rubric}
															onChange={(e) => handleRubricChange(categoryIndex, rubricIndex, e.target.value)}
															placeholder={`評分標準 #${rubricIndex + 1}`}
														/>
														<Button variant="ghost" size="icon" onClick={() => handleRemoveRubric(categoryIndex, rubricIndex)}>
															<X className="h-4 w-4" />
														</Button>
													</div>
												))}
												<Button variant="outline" onClick={() => handleAddRubric(categoryIndex)}>新增評分標準</Button>
											</div>
										))}
										<Button onClick={handleAddCategory}>新增評分項目</Button>
									</div>
								</TabsContent>
							</div>
						</Tabs>

						{imageUrl && (
							<div className="mt-4">
								<Label className="mb-2 block">圖片預覽</Label>
							</div>
						)}
					</div>
					<DialogFooter className="p-6 pt-1">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							取消
						</Button>
						<Button onClick={handleSubmit}>創建產線</Button>
					</DialogFooter>
				</div>


				{/* Right Column */}
				<div className="border-l">
					<DialogTitle className="text-2xl px-6 pt-7">預設內容</DialogTitle>
					<ScrollArea className="pb-4 min-h-[70vh] max-h-[70vh] h-full">
						<div className="h-full p-6">
							{selectedExample ? (
								<div className="space-y-4">
									{selectedExample.defaultHintMessage && selectedExample.defaultHintMessage.length > 0 && (
										<div>
											<div className="font-medium text-lg mb-1">提示訊息</div>
											<ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
												{selectedExample.defaultHintMessage.map((hint, i) => (
													<li key={i}>{hint}</li>
												))}
											</ul>
										</div>
									)}
									{selectedExample.defaultTestMessageDatasets && selectedExample.defaultTestMessageDatasets.length > 0 && <div className="border-t-2 border-gray-700 mt-6 pb-1"></div>}
									{selectedExample.defaultTestMessageDatasets && selectedExample.defaultTestMessageDatasets.length > 0 && (
										<div>
											<div className="font-medium text-lg mb-2">預設測試集</div>
											<div className="space-y-2">
												{selectedExample.defaultTestMessageDatasets.map((dataset, i) => (
													<div key={i}>
														<p className="font-normal underline pb-1">{dataset.name}</p>
														<div className="p-2 border rounded-md">
															<ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-1">
																{dataset.messages.map((msg, j) => (
																	<li key={j}><strong>訊息:</strong> {msg.message} | <strong>要求:</strong> {msg.require}</li>
																))}
															</ul>
														</div>
													</div>
												))}
											</div>
										</div>
									)}
									{selectedExample.defaultRatingCategories && selectedExample.defaultRatingCategories.length > 0 && <div className="border-t-2 border-gray-700 mt-6 pb-1"></div>}
									{selectedExample.defaultRatingCategories && selectedExample.defaultRatingCategories.length > 0 && (
										<div>
											<div className="font-medium text-lg mb-2">預設評分項目</div>
											<div className="space-y-2">
												{selectedExample.defaultRatingCategories.map((category, i) => (
													<div key={i}>
														<p className="font-normal underline pb-1">{category.name}</p>
														<div className="p-2 border rounded-md">
															<ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-1">
																{category.rubrics.map((rubric, j) => (
																	<li key={j}>{rubric}</li>
																))}
															</ul>
														</div>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							) : (
								<div className="flex items-center justify-center h-full">
									<p className="text-muted-foreground">請在左側選擇一個預設範例以查看詳細資訊</p>
								</div>
							)}
						</div>
					</ScrollArea>
				</div>
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


