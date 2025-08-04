import React, { useState } from "react";
import { useAdvancedStore } from "@/lib/store/advanced";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Save, Trash2 } from "lucide-react";
import { MessageDatasetItem } from "./message-dataset-item"

export const MessageDatasetView: React.FC = () => {
	const {
		testMessageDatasets,
		addTestMessageSet,
		deleteTestMessageSet,
		updateTestMessageSetName,
		addMessageToSet,
		updateMessageInSet,
		deleteMessageFromSet,
	} = useAdvancedStore();

	const [isCreatingNewSet, setIsCreatingNewSet] = useState(false);
	const [newSetName, setNewSetName] = useState("");
	const [deleteTarget, setDeleteTarget] = useState<{
		setId: string;
		messageId?: string;
	} | null>(null);

	const handleAddNewSet = () => {
		if (newSetName.trim()) {
			addTestMessageSet(newSetName.trim());
			setNewSetName("");
			setIsCreatingNewSet(false);
		}
	};

	const handleCancelNewSet = () => {
		setNewSetName("");
		setIsCreatingNewSet(false);
	};

	const handleUpdateMessage = (
		setId: string,
		msgId: string,
		field: "message" | "require",
		value: string
	) => {
		updateMessageInSet(setId, msgId, { [field]: value });
	};

	const handleDeleteConfirm = () => {
		if (deleteTarget) {
			if (deleteTarget.messageId) {
				deleteMessageFromSet(deleteTarget.setId, deleteTarget.messageId);
			} else {
				deleteTestMessageSet(deleteTarget.setId);
			}
			setDeleteTarget(null);
		}
	};

	return (
		<div className="px-4 py-6 overflow-y-auto h-[calc(100vh-130px)]">
			<div className="flex justify-between items-center mb-2 ml-2">
				{!isCreatingNewSet && (
					<Button
						onClick={() => setIsCreatingNewSet(true)}
						className="pr-5 bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg"
					>
						<Plus className="h-4 w-4" />
						建立新的測試集
					</Button>
				)}
			</div>
			<div className="w-full flex-grow overflow-y-auto px-2 py-4">
				<div className="grid gap-4">
					{isCreatingNewSet && (
						<div className="border-2 border-gray-700 rounded-lg p-4 space-y-4 -mt-4">
							<div className="flex justify-between items-start">
								<Input
									value={newSetName}
									onChange={e => setNewSetName(e.target.value)}
									placeholder="為新的測試集命名..."
									onKeyDown={e => {
										if (e.key === "Enter") handleAddNewSet();
										if (e.key === "Escape") handleCancelNewSet();
									}}
									className="font-semibold text-lg tracking-tight"
									autoFocus
								/>
								<div className="flex items-center space-x-1 -mt-1">
									<Button variant="ghost" size="icon" onClick={handleAddNewSet}>
										<Save className="h-4 w-4" />
									</Button>
									<Button variant="ghost" size="icon" onClick={handleCancelNewSet}>
										<Trash2 className="h-4 w-4 text-destructive" />
									</Button>
								</div>
							</div>
						</div>
					)}
					{testMessageDatasets.length > 0 ? (
						testMessageDatasets.map(testSet => (
							<MessageDatasetItem
								key={testSet.id}
								testSet={testSet}
								onUpdateSetName={updateTestMessageSetName}
								onDeleteSet={setId => setDeleteTarget({ setId })}
								onAddMessage={setId => addMessageToSet(setId, { message: "", require: "" })}
								onUpdateMessage={handleUpdateMessage}
								onDeleteMessage={(setId, messageId) => setDeleteTarget({ setId, messageId })}
							/>
						))
					) : (
						!isCreatingNewSet && (
							<div className="col-span-full flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16">
								<p>尚未建立任何測試集。</p>
								<p>點擊「建立新的測試集」以開始。</p>
							</div>
						)
					)}
				</div>
			</div>

			<AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>確定要刪除嗎？</AlertDialogTitle>
						<AlertDialogDescription>
							此操作無法復原。這將永久刪除
							{deleteTarget?.messageId ? "此訊息" : "此測試集及其所有訊息"}。
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogAction onClick={handleDeleteConfirm}>刪除</AlertDialogAction>
						<AlertDialogCancel>取消</AlertDialogCancel>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

