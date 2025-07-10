"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronRight } from "lucide-react"

interface SavedVersion {
	id: string
	name: string
	savedAt: Date
	systemPrompt: string
	userPrompt: string
	temperature: number
	batchSize: string
	parameter2: string
	parameter3: string
	selectedModels: string[]
	selectedTools: string[]
	expanded?: boolean
	data?: any // Add optional data property
}

interface VersionCardCompareProps {
	version: SavedVersion
	isSelected: boolean
	onToggleSelect: (versionId: string) => void
	onToggleExpanded: (versionId: string) => void
}

export function VersionCardCompare({ version, isSelected, onToggleSelect, onToggleExpanded }: VersionCardCompareProps) {
	// Add safe access with default values and comprehensive fallbacks
	const selectedModels = version.selectedModels || version.data?.models || []
	const selectedTools = version.selectedTools || version.data?.tools || []
	const systemPrompt = version.systemPrompt || ""
	const userPrompt = version.userPrompt || ""
	const temperature = version.temperature ?? version.data?.parameters?.temperature ?? 0
	const batchSize = version.batchSize || version.data?.parameters?.batchSize || "1"
	const parameter2 = version.parameter2 || version.data?.parameters?.parameter2 || ""
	const parameter3 = version.parameter3 || version.data?.parameters?.parameter3 || ""

	// 安全獲取系統提示數據
	const safeSystemPrompt = version.data?.systemPrompt
		? {
			characterSettings: version.data.systemPrompt.characterSettings || "",
			selfAwareness: version.data.systemPrompt.selfAwareness || "",
			workflow: version.data.systemPrompt.workflow || "",
			formatLimits: version.data.systemPrompt.formatLimits || "",
			usedTools: version.data.systemPrompt.usedTools || "",
			repliesLimits: version.data.systemPrompt.repliesLimits || "",
			preventLeaks: version.data.systemPrompt.preventLeaks || "",
		}
		: null

	// 安全獲取用戶提示數據
	const safeUserPrompt = version.data?.userPrompt || []

	return (
		<motion.div
			initial={{ x: -20, opacity: 0 }}
			animate={{ x: 0, opacity: 1 }}
			exit={{ x: -20, opacity: 0 }}
			transition={{ duration: 0.3 }}
			whileHover={{ scale: 1.02 }}
		>
			<Card className={`bg-gray-900 border-gray-800 ${isSelected ? "ring-2 ring-blue-500" : ""}`}>
				<div className="p-3">
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center space-x-3">
							<Checkbox
								checked={isSelected}
								onCheckedChange={() => onToggleSelect(version.id)}
								className="border-gray-600"
							/>
							<div>
								<h3 className="font-medium text-white">{version.name}</h3>
								<p className="text-xs text-gray-400">{version.savedAt.toLocaleString()}</p>
							</div>
						</div>
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<button
								onClick={() => onToggleExpanded(version.id)}
								className="text-gray-400 hover:text-white transition-colors"
							>
								<motion.div animate={{ rotate: version.expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
									<ChevronRight className="w-4 h-4" />
								</motion.div>
							</button>
						</motion.div>
					</div>
					{version.expanded && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.3 }}
							className="text-xs text-gray-300 space-y-2 border-t border-gray-800 pt-2 overflow-hidden"
						>
							{/* 新版本數據結構 */}
							{safeSystemPrompt && (
								<div>
									<p className="text-gray-400 mb-1">System Prompt (新格式):</p>
									<div className="text-gray-300 bg-gray-900 p-2 rounded text-xs max-h-20 overflow-y-auto border border-gray-800 space-y-1">
										<div>
											<span className="text-gray-400">角色設定:</span> {safeSystemPrompt.characterSettings || "無"}
										</div>
										<div>
											<span className="text-gray-400">自我認知:</span> {safeSystemPrompt.selfAwareness || "無"}
										</div>
										<div>
											<span className="text-gray-400">任務流程:</span> {safeSystemPrompt.workflow || "無"}
										</div>
										<div>
											<span className="text-gray-400">格式限制:</span> {safeSystemPrompt.formatLimits || "無"}
										</div>
										<div>
											<span className="text-gray-400">工具使用:</span> {safeSystemPrompt.usedTools || "無"}
										</div>
										<div>
											<span className="text-gray-400">回覆限制:</span> {safeSystemPrompt.repliesLimits || "無"}
										</div>
										<div>
											<span className="text-gray-400">防洩漏:</span> {safeSystemPrompt.preventLeaks || "無"}
										</div>
									</div>
								</div>
							)}

							{/* 舊版本數據結構 */}
							{!safeSystemPrompt && systemPrompt && (
								<div>
									<p className="text-gray-400 mb-1">System Prompt (舊格式):</p>
									<p className="text-gray-300 bg-gray-900 p-2 rounded text-xs max-h-20 overflow-y-auto border border-gray-800">
										{systemPrompt}
									</p>
								</div>
							)}

							{/* User Prompt */}
							<div>
								<p className="text-gray-400 mb-1">User Prompt:</p>
								<div className="text-gray-300 bg-gray-900 p-2 rounded text-xs max-h-20 overflow-y-auto border border-gray-800">
									{safeUserPrompt.length > 0
										? safeUserPrompt.map((prompt, idx) => (
											<div key={prompt.id || idx}>
												{idx + 1}. {prompt.content || "無內容"}
											</div>
										))
										: userPrompt
											? userPrompt
											: "無"}
								</div>
							</div>

							<div className="grid grid-cols-2 gap-2">
								<p>
									<span className="text-gray-400">Temperature:</span> {temperature}
								</p>
								<p>
									<span className="text-gray-400">Batch Size:</span> {batchSize}
								</p>
								<p>
									<span className="text-gray-400">Parameter 2:</span> {parameter2}
								</p>
								<p>
									<span className="text-gray-400">Parameter 3:</span> {parameter3}
								</p>
							</div>
							<p>
								<span className="text-gray-400">Models:</span> {selectedModels.join(", ") || "無"}
							</p>
							<p>
								<span className="text-gray-400">Tools:</span> {selectedTools.join(", ") || "無"}
							</p>
						</motion.div>
					)}
				</div>
			</Card>
		</motion.div>
	)
}