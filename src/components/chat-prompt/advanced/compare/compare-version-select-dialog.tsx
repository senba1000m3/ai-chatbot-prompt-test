"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../../../ui/dialog"
import { Button } from "../../../ui/button"
import { usePromptStore, type SavedVersion } from "../../../../lib/store/prompt"
import { CompareVersionCard } from "../compare/compare-version-card"
import { ScrollArea } from "../../../ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

interface CompareVersionSelectDialogProps {
	isOpen: boolean
	onOpenChange: (isOpen: boolean) => void
}

const versionColors = [
	{ border: "border-blue-500", bg: "bg-blue-900/20", badge: "bg-blue-600" },
	{ border: "border-green-500", bg: "bg-green-900/20", badge: "bg-green-600" },
	{ border: "border-purple-500", bg: "bg-purple-900/20", badge: "bg-purple-600" },
	{ border: "border-orange-500", bg: "bg-orange-900/20", badge: "bg-orange-600" },
	{ border: "border-pink-500", bg: "bg-pink-900/20", badge: "bg-pink-600" },
]

export function CompareVersionSelectDialog({ isOpen, onOpenChange }: CompareVersionSelectDialogProps) {
	const { savedVersions, compareSelectedVersions, updateCompareVersions } = usePromptStore()
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
	const [expandedInDialog, setExpandedInDialog] = useState<Set<string>>(new Set())

	useEffect(() => {
		if (isOpen) {
			setSelectedIds(new Set(compareSelectedVersions))
		}
	}, [isOpen, compareSelectedVersions])

	const versionColorMap = useMemo(() => {
		const colorMap: { [versionId: string]: number } = {}
		const sortedVersions = [...savedVersions].sort((a, b) => a.id.localeCompare(b.id))
		sortedVersions.forEach((version, index) => {
			colorMap[version.id] = index % versionColors.length
		})
		return colorMap
	}, [savedVersions])

	const handleSelectVersion = (versionId: string) => {
		setSelectedIds((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(versionId)) {
				newSet.delete(versionId)
			} else {
				newSet.add(versionId)
			}
			return newSet
		})
	}

	const handleToggleExpand = (versionId: string) => {
		setExpandedInDialog(prev => {
			const newSet = new Set(prev)
			if (newSet.has(versionId)) {
				newSet.delete(versionId)
			} else {
				newSet.add(versionId)
			}
			return newSet
		})
	}

	const handleConfirm = () => {
		updateCompareVersions(Array.from(selectedIds))
		onOpenChange(false)
	}

	const isConfirmDisabled = selectedIds.size < 1

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[75vh] grid grid-rows-[auto_1fr_auto] bg-gray-900 text-white border-gray-700">
				<DialogHeader>
					<DialogTitle>
						選擇要進行比較的版本（已選{" "}
						<span className={isConfirmDisabled ? "text-red-500" : ""}>
							{selectedIds.size}
						</span>{" "}
						/ {savedVersions.length} 個）
					</DialogTitle>
				</DialogHeader>
				<div className="overflow-y-auto min-h-0 pr-6 -mr-6 py-5 px-1 gap-4 flex flex-col">
					{savedVersions.map((version, index) => {
						const isSelected = selectedIds.has(version.id)
						const colorConfig = versionColors[versionColorMap[version.id]]
						return (
							<div key={version.id} className="flex items-start space-x-3">
								<Checkbox
									id={`select-${version.id}`}
									checked={isSelected}
									onCheckedChange={() => handleSelectVersion(version.id)}
									className="mt-7 mr-5 w-4 h-4"
								/>
								<div className="flex-1">
									<CompareVersionCard
										version={version}
										colorConfig={colorConfig}
										isExpanded={expandedInDialog.has(version.id)}
										isDragOver={false}
										isDragging={false}
										onToggleExpand={() => handleToggleExpand(version.id)}
										onDragStart={() => {}}
										onDragOver={() => {}}
										onDragLeave={() => {}}
										onDrop={() => {}}
										onDragEnd={() => {}}
										index={index}
										hideGrip={true}
									/>
								</div>
							</div>
						)
					})}
				</div>
				<DialogFooter>
					{isConfirmDisabled && (
						<p className="text-base text-yellow-500 mr-auto mt-2">請至少選擇一個版本</p>
					)}
					<Button onClick={handleConfirm}>確定</Button>
					<DialogClose asChild>
						<Button variant="ghost" className="border border-gray-700">取消</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

