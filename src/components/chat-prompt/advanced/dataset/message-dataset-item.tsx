import React, { useState, useRef, useEffect } from "react";
import { useAdvancedStore, type TestMessageSet } from "@/lib/store/advanced";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Trash2, Edit, Save, Plus } from "lucide-react";

export const MessageDatasetItem: React.FC<{
	testSet: TestMessageSet;
	onUpdateSetName: (id: string, newName: string) => void;
	onDeleteSet: (id: string) => void;
	onAddMessage: (setId: string) => void;
	onUpdateMessage: (setId: string, msgId: string, field: "message" | "require", value: string) => void;
	onDeleteMessage: (setId: string, msgId: string) => void;
}> = ({
		  testSet,
		  onUpdateSetName,
		  onDeleteSet,
		  onAddMessage,
		  onUpdateMessage,
		  onDeleteMessage,
	  }) => {
	const [isEditingName, setIsEditingName] = useState(false);
	const [setName, setSetName] = useState(testSet.name);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isEditingName) {
			inputRef.current?.focus();
		}
	}, [isEditingName]);

	const handleSaveName = () => {
		if (setName.trim()) {
			onUpdateSetName(testSet.id, setName.trim());
			setIsEditingName(false);
		}
	};

	const firstMessage = testSet.messages[0]?.message;
	const firstRequire = testSet.messages[0]?.require;
	const otherMessagesCount = testSet.messages.length > 1 ? testSet.messages.length - 1 : 0;

	return (
		<div className="border border-2 border-gray-700 rounded-lg p-4 space-y-4 px-5">
			<div className="flex justify-between items-start">
				<div>
					{isEditingName ? (
						<Input
							ref={inputRef}
							value={setName}
							onChange={e => setSetName(e.target.value)}
							onKeyDown={e => {
								if (e.key === "Enter") handleSaveName();
								if (e.key === "Escape") setIsEditingName(false);
							}}
							className="font-semibold text-lg tracking-tight min-w-100"
						/>
					) : (
						<h3 className="font-semibold text-lg tracking-tight pt-1 pl-2">{testSet.name}</h3>
					)}
				</div>

				<div className="flex items-center space-x-1 -mt-1">
					{isEditingName ? (
						<Button variant="ghost" size="icon" onClick={handleSaveName}>
							<Save className="h-4 w-4" />
						</Button>
					) : (
						<Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)}>
							<Edit className="h-4 w-4" />
						</Button>
					)}
					<Button variant="ghost" size="icon" onClick={() => onDeleteSet(testSet.id)}>
						<Trash2 className="h-4 w-4 text-destructive" />
					</Button>
				</div>
			</div>

				{(firstMessage || firstRequire) && (
				<div className="p-3 border rounded-md bg-muted/50 space-y-3">
					{firstMessage && (
						<div>
							<p className="text-base font-medium">訊息</p>
							<p className="text-sm text-muted-foreground truncate">{firstMessage}</p>
						</div>
					)}
					{firstRequire && (
						<div>
							<p className="text-base font-medium">要求</p>
							<p className="text-sm text-muted-foreground truncate">{firstRequire}</p>
						</div>
					)}
					{otherMessagesCount > 0 && (
						<p className="text-sm pt-2">
							…… 以及其他 {otherMessagesCount} 個對話內容
						</p>
					)}
				</div>
			)}
			<Accordion type="single" collapsible className="w-full">
				<AccordionItem value="messages" className="border-none">
					<AccordionTrigger className="justify-start gap-2 text-sm text-muted-foreground py-1 ml-2">
						查看/編輯全部 {testSet.messages.length} 則測試集訊息
					</AccordionTrigger>
					<AccordionContent>
						<div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
							{testSet.messages.map(item => (
								<div
									key={item.id}
									className="p-4 px-6 border rounded-lg bg-background shadow-sm"
								>
									<div className="space-y-3 mt-2">
										<div className="flex flex-col w-full mb-5">
											<label className="text-sm font-medium mb-2">訊息（Message）</label>
											<Input
												className="w-full"
												value={item.message}
												onChange={e =>
													onUpdateMessage(
														testSet.id,
														item.id,
														"message",
														e.target.value
													)
												}
												placeholder="例如：請問怎麼積分x^3"
											/>
										</div>
										<div className="flex flex-col w-full">
											<label className="text-sm font-medium mb-2">要求（Require）</label>
											<Textarea
												value={item.require}
												onChange={e =>
													onUpdateMessage(
														testSet.id,
														item.id,
														"require",
														e.target.value
													)
												}
												placeholder="例如：答案是 1/4x^4..."
												rows={3}
											/>
										</div>
									</div>
									<div className="flex justify-start mt-3">
										<Button
											variant="ghost"
											size="icon"
											className="w-18 text-red-500 hover:text-red-500"
											onClick={() => onDeleteMessage(testSet.id, item.id)}
										>
											<Trash2 className="h-4 w-4" />刪除
										</Button>
									</div>
								</div>
							))}
						</div>
						<Button
							onClick={() => onAddMessage(testSet.id)}
							variant="outline"
							className="w-full mt-5"
						>
							<Plus className="h-4 w-4" />
							新增測試訊息
						</Button>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
};


