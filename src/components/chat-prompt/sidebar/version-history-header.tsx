"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, ArrowUpDown, X, GitCompare, ChevronDown, CheckSquare, Upload } from "lucide-react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { usePromptStore, type SavedVersion } from "@/lib/store/prompt";
import { nanoid } from "nanoid"

interface VersionHistoryHeaderProps {
	searchQuery: string
	onSearchChange: (query: string) => void
	selectedModels: string[]
	onModelFilterChange: (models: string[]) => void
	selectedCharacterSettings: string[]
	onCharacterSettingsFilterChange: (settings: string[]) => void
	selectedTools: string[]
	onToolsFilterChange: (tools: string[]) => void
	sortBy: string
	onSortChange: (sortBy: string) => void
	availableModels: string[]
	availableCharacterSettings: string[]
	availableTools: string[]
}

export function VersionHistoryHeader({
										 searchQuery,
										 onSearchChange,
										 selectedModels,
										 onModelFilterChange,
										 selectedCharacterSettings,
										 onCharacterSettingsFilterChange,
										 selectedTools,
										 onToolsFilterChange,
										 sortBy,
										 onSortChange,
										 availableModels,
										 availableCharacterSettings,
										 availableTools,
									 }: VersionHistoryHeaderProps) {
	const [showFilters, setShowFilters] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { savedVersions, setSavedVersions, isCompareMode, setIsCompareMode, compareSelectedVersions, setCompareSelectedVersions, clearCompareSelectedVersions,
		setIsInCompareView, setCompareVersions, setShowVersionHistory, setInitialVersionOrder, addSavedVersion} = usePromptStore();

	const isAllSelected = compareSelectedVersions.length === savedVersions.length && savedVersions.length > 0

	const handleToggleCompareMode = () => {
		setIsCompareMode(!isCompareMode)
		clearCompareSelectedVersions()

		if (!isCompareMode) {
			setSavedVersions(savedVersions.map((version) => ({ ...version, expanded: false })));
		}
	}


	const handleSelectAll = () => {
		if (isAllSelected) {
			clearCompareSelectedVersions();
		}
		else {
			savedVersions.map((v) => {
				if (!compareSelectedVersions.includes(v.id)) {
					setCompareSelectedVersions(v.id);
				}
			})
		}
	}

	const handleConfirmCompare = () => {
		const versionsToCompare = savedVersions.filter((v) => compareSelectedVersions.includes(v.id))
		setCompareVersions(versionsToCompare)
		setInitialVersionOrder(compareSelectedVersions)
		setIsInCompareView(true)
		setShowVersionHistory(false)
	}

	const handleCancelCompare = () => {
		setIsCompareMode(false)
		clearCompareSelectedVersions();
	}

	const handleModelToggle = (model: string) => {
		if (selectedModels.includes(model)) {
			onModelFilterChange(selectedModels.filter((m) => m !== model))
		} else {
			onModelFilterChange([...selectedModels, model])
		}
	}

	const handleCharacterSettingsToggle = (setting: string) => {
		if (selectedCharacterSettings.includes(setting)) {
			onCharacterSettingsFilterChange(selectedCharacterSettings.filter((s) => s !== setting))
		} else {
			onCharacterSettingsFilterChange([...selectedCharacterSettings, setting])
		}
	}

	const handleToolToggle = (tool: string) => {
		if (selectedTools.includes(tool)) {
			onToolsFilterChange(selectedTools.filter((t) => t !== tool))
		} else {
			onToolsFilterChange([...selectedTools, tool])
		}
	}

	const clearAllFilters = () => {
		onModelFilterChange([])
		onCharacterSettingsFilterChange([])
		onToolsFilterChange([])
		onSearchChange("")
	}

	const hasActiveFilters =
		selectedModels.length > 0 ||
		selectedCharacterSettings.length > 0 ||
		selectedTools.length > 0 ||
		searchQuery.length > 0

	const getSortLabel = (value: string) => {
		// 修正排序 key 與 sidebar-container 一致
		switch (value) {
			case "date-desc":
				return "最新優先"
			case "date-asc":
				return "最舊優先"
			case "name-asc":
				return "名稱 A-Z"
			case "name-desc":
				return "名稱 Z-A"
			case "accuracy-high":
				return "準確率高-低"
			case "accuracy-low":
				return "準確率低-高"
			default:
				return "最新優先"
		}
	}

	const handleUploadVersion = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const json = JSON.parse(e.target?.result as string);
				if (json && json.name && json.data) {
					const baseName = json.name;
					let newName = baseName;
					let num = 1;
					const nameExists = (name: string) => savedVersions.some(v => v.name === name);
					while (nameExists(newName)) {
						newName = `${baseName} ${++num}`;
					}
					addSavedVersion({ ...json, name: newName, id: nanoid() });
				} else {
					alert("格式錯誤，請確認檔案內容");
				}
			} catch (err) {
				alert("無法解析 JSON 檔案");
			}
		};
		reader.readAsText(file);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const handleUploadButtonClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className="p-4 border-b border-gray-800 bg-gray-900">
			<div className="flex items-center justify-between mb-3">
				<h2 className="text-lg font-semibold text-white">版本歷史</h2>
				<div className="flex items-center gap-2">
					{!isCompareMode && (
						<>
							<Button
								variant="outline"
								size="sm"
								className="border-yellow-600 text-yellow-400 hover:bg-yellow-900 bg-transparent flex items-center gap-1"
								onClick={handleUploadButtonClick}
							>
								<Upload className="w-4 h-4" />
								上傳
							</Button>
							<input
								ref={fileInputRef}
								type="file"
								accept="application/json"
								style={{ display: "none" }}
								onChange={handleUploadVersion}
							/>
							<Button
								variant="outline"
								size="sm"
								onClick={handleToggleCompareMode}
								className="text-blue-300 border-blue-600 hover:bg-blue-800 bg-transparent"
							>
								<GitCompare className="w-4 h-4 mr-1" />
								進入 QC 區
							</Button>
						</>
					)}
					{isCompareMode && (
						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								size="sm"
								onClick={handleSelectAll}
								className={`text-xs px-2 py-1 h-9 transition-colors ${
									isAllSelected
										? "text-orange-300 border-orange-600 hover:bg-orange-800 bg-transparent"
										: "text-purple-300 border-purple-600 hover:bg-purple-800 bg-transparent"
								}`}
							>
								{isAllSelected ? (
									"取消全選"
								) : (
									<>
										<CheckSquare className="w-3 h-3 mr-1" />
										全選
									</>
								)}
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={handleConfirmCompare}
								disabled={compareSelectedVersions.length < 1}
								className="bg-green-600 border-green-500 text-white hover:bg-green-700 disabled:opacity-50"
							>
								確認
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={handleCancelCompare}
								className="bg-red-600 border-red-500 text-white hover:bg-red-700"
							>
								取消
							</Button>
						</div>
					)}
				</div>
			</div>

			{isCompareMode && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					className="mb-3 p-2 bg-blue-900/20 border border-blue-500/30 rounded-lg"
				>
					<div className="text-sm text-blue-400">
						已選擇 {compareSelectedVersions.length} 個基礎版本
						{compareSelectedVersions.length == 1 && <span className="text-green-400 ml-2">✓ 可以單個測試</span>}
						{compareSelectedVersions.length >= 2 && <span className="text-green-400 ml-2">✓ 可以開始比較</span>}
					</div>
				</motion.div>
			)}

			{/* 搜尋框 */}
			<div className="relative mb-3">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
				<Input
					placeholder="搜尋版本名稱..."
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					className="pl-10 bg-gray-800 border-gray-700 text-white h-9"
				/>
			</div>

			{/* 篩選和排序控制 */}
			<div className="flex items-center justify-between mb-3">
				<Button
					variant="outline"
					size="sm"
					onClick={() => setShowFilters(!showFilters)}
					className={`bg-gray-800 border-gray-700 text-white hover:bg-gray-700 ${hasActiveFilters ? "border-blue-500 text-blue-400" : ""}`}
				>
					<Filter className="w-4 h-4" />篩選模型
					{hasActiveFilters && (
						<Badge variant="secondary" className="bg-blue-600 text-white text-xs">
							{selectedModels.length + selectedCharacterSettings.length + selectedTools.length}
						</Badge>
					)}
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm" className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
							<ArrowUpDown className="w-4 h-4 mr-1" />
							{getSortLabel(sortBy)}
							<ChevronDown className="w-4 h-4 ml-1" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="bg-gray-900 border-gray-700">
						<DropdownMenuItem onClick={() => onSortChange("date-desc")} className="text-white hover:bg-gray-800">
							最新優先
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onSortChange("date-asc")} className="text-white hover:bg-gray-800">
							最舊優先
						</DropdownMenuItem>
						<DropdownMenuSeparator className="bg-gray-700" />
						<DropdownMenuItem onClick={() => onSortChange("name-asc")} className="text-white hover:bg-gray-800">
							名稱 A-Z
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onSortChange("name-desc")} className="text-white hover:bg-gray-800">
							名稱 Z-A
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onSortChange("accuracy-high")} className="text-white hover:bg-gray-800">
							準確率高-低
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onSortChange("accuracy-low")} className="text-white hover:bg-gray-800">
							準確率低-高
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* 篩選選項 */}
			<AnimatePresence>
				{showFilters && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="space-y-3 overflow-hidden mb-3"
					>
						{/* 清除篩選按鈕 */}
						{hasActiveFilters && (
							<div className="flex justify-end">
								<Button
									variant="ghost"
									size="sm"
									onClick={clearAllFilters}
									className="text-gray-400 hover:text-white hover:bg-gray-800 text-xs"
								>
									<X className="w-3 h-3 mr-1" />
									清除所有篩選
								</Button>
							</div>
						)}

						{/* 模型篩選 */}
						{availableModels.length > 0 && (
							<div>
								<label className="block text-xs font-medium text-gray-400 mb-2">模型篩選</label>
								<div className="flex flex-wrap gap-1">
									{availableModels.map((model) => (
										<Badge
											key={model}
											variant={selectedModels.includes(model) ? "default" : "outline"}
											className={`cursor-pointer text-xs transition-colors ${
												selectedModels.includes(model)
													? "bg-blue-500/20 border-blue-500/30 text-blue-400"
													: "border-gray-600 text-gray-400 hover:border-blue-500/30 hover:text-blue-400"
											}`}
											onClick={() => handleModelToggle(model)}
										>
											{model}
										</Badge>
									))}
								</div>
							</div>
						)}

						{/* 角色設定篩選 */}
						{availableCharacterSettings.length > 0 && (
							<div>
								<label className="block text-xs font-medium text-gray-400 mb-2">角色設定篩選</label>
								<div className="flex flex-wrap gap-1">
									{availableCharacterSettings.map((setting) => (
										<Badge
											key={setting}
											variant={selectedCharacterSettings.includes(setting) ? "default" : "outline"}
											className={`cursor-pointer text-xs transition-colors ${
												selectedCharacterSettings.includes(setting)
													? "bg-purple-500/20 border-purple-500/30 text-purple-400"
													: "border-gray-600 text-gray-400 hover:border-purple-500/30 hover:text-purple-400"
											}`}
											onClick={() => handleCharacterSettingsToggle(setting)}
										>
											{setting.length > 40 ? setting.substring(0, 40) + "..." : setting}
										</Badge>
									))}
								</div>
							</div>
						)}

						{/* 工具篩選 */}
						{availableTools.length > 0 && (
							<div>
								<label className="block text-xs font-medium text-gray-400 mb-2">工具篩選</label>
								<div className="flex flex-wrap gap-1">
									{availableTools.map((tool) => (
										<Badge
											key={tool}
											variant={selectedTools.includes(tool) ? "default" : "outline"}
											className={`cursor-pointer text-xs transition-colors ${
												selectedTools.includes(tool)
													? "bg-green-500/20 border-green-500/30 text-green-400"
													: "border-gray-600 text-gray-400 hover:border-green-500/30 hover:text-green-400"
											}`}
											onClick={() => handleToolToggle(tool)}
										>
											{tool}
										</Badge>
									))}
								</div>
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>

			{/* 活躍篩選標籤 */}
			{hasActiveFilters && (
				<div className="mt-3 pt-3 border-t border-gray-700">
					<div className="flex flex-wrap gap-1">
						{selectedModels.map((model) => (
							<Badge
								key={`model-${model}`}
								variant="secondary"
								className="bg-blue-500/20 border-blue-500/30 text-blue-400 text-xs"
							>
								{model}
								<X
									className="w-3 h-3 ml-1 cursor-pointer hover:text-blue-300"
									onClick={() => handleModelToggle(model)}
								/>
							</Badge>
						))}
						{selectedCharacterSettings.map((setting) => (
							<Badge
								key={`setting-${setting}`}
								variant="secondary"
								className="bg-purple-500/20 border-purple-500/30 text-purple-400 text-xs"
							>
								{setting.length > 15 ? setting.substring(0, 15) + "..." : setting}
								<X
									className="w-3 h-3 ml-1 cursor-pointer hover:text-purple-300"
									onClick={() => handleCharacterSettingsToggle(setting)}
								/>
							</Badge>
						))}
						{selectedTools.map((tool) => (
							<Badge
								key={`tool-${tool}`}
								variant="secondary"
								className="bg-green-500/20 border-green-500/30 text-green-400 text-xs"
							>
								{tool}
								<X
									className="w-3 h-3 ml-1 cursor-pointer hover:text-green-300"
									onClick={() => handleToolToggle(tool)}
								/>
							</Badge>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
