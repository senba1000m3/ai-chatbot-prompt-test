"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { ExternalLink, ChevronDown, GripVertical, Palette, PaintBucket, Eye, Send, Filter } from "lucide-react"
import { useState, useMemo, useRef } from "react"
import { MessageBubble } from "../chat/message-bubble"

interface Message {
	role: "user" | "assistant"
	content: string
	model?: string
	rating?: "good" | "bad" | null
	id?: string
}

interface ModelResponse {
	id: string
	name: string
	messages: Message[]
	isLoading: boolean
}

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
	modelResponses: ModelResponse[]
	expanded?: boolean
}

interface VersionCompareViewProps {
	compareVersions: SavedVersion[]
	chatHeight: number
	colorMode: number
	onVersionReorder: (newOrder: SavedVersion[]) => void
	onColorModeChange: () => void
	initialVersionOrder?: SavedVersion[]
	onUpdateVersions: (updatedVersions: SavedVersion[]) => void
}

// 版本顏色配置
const versionColors = [
	{ border: "border-blue-500", bg: "bg-blue-900/20", badge: "bg-blue-600" },
	{ border: "border-green-500", bg: "bg-green-900/20", badge: "bg-green-600" },
	{ border: "border-purple-500", bg: "bg-purple-900/20", badge: "bg-purple-600" },
	{ border: "border-orange-500", bg: "bg-orange-900/20", badge: "bg-orange-600" },
	{ border: "border-pink-500", bg: "bg-pink-900/20", badge: "bg-pink-600" },
]

// 可用模型列表
const availableModels = [
	{ id: "gpt-4o", name: "gpt-4o", category: "OpenAI Models" },
	{ id: "gpt-4o-mini", name: "gpt-4o-mini", category: "OpenAI Models" },
	{ id: "gemini-2.0-flash", name: "gemini-2.0-flash", category: "Gemini Models" },
	{ id: "gemini-2.0-flash-lite", name: "gemini-2.0-flash-lite", category: "Gemini Models" },
	{ id: "gemini-2.0-pro-exp-02-05", name: "gemini-2.0-pro-exp-02-05", category: "Gemini Models" },
]

export function VersionCompareView({
									   compareVersions,
									   chatHeight,
									   colorMode,
									   onVersionReorder,
									   onColorModeChange,
									   initialVersionOrder,
									   onUpdateVersions,
								   }: VersionCompareViewProps) {
	const [selectedModels, setSelectedModels] = useState<{ [versionId: string]: string }>(() => {
		const initial: { [versionId: string]: string } = {}
		compareVersions.forEach((version) => {
			initial[version.id] = version.selectedModels[0] || "gpt-4o"
		})
		return initial
	})

	const [globalModelFilter, setGlobalModelFilter] = useState<string>("all")
	const [draggedItem, setDraggedItem] = useState<SavedVersion | null>(null)
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
	const [fullscreenVersion, setFullscreenVersion] = useState<string | null>(null)
	const [columnWidth, setColumnWidth] = useState(() => {
		return compareVersions.length === 2 ? 100 : 85
	})

	// 聊天輸入相關狀態
	const [inputMessage, setInputMessage] = useState("")
	const scrollRefs = useRef<(HTMLDivElement | null)[]>([])

	// 為每個版本分配固定的顏色索引，基於版本ID而不是當前位置
	const versionColorMap = useMemo(() => {
		const colorMap: { [versionId: string]: number } = {}
		const sortedVersions = [...compareVersions].sort((a, b) => a.id.localeCompare(b.id))

		sortedVersions.forEach((version, index) => {
			colorMap[version.id] = index % versionColors.length
		})

		return colorMap
	}, [compareVersions])

	// 使用初始順序來顯示版本名稱，如果沒有提供則使用當前順序
	const displayVersionNames = useMemo(() => {
		const versionsForDisplay = initialVersionOrder || compareVersions
		return versionsForDisplay.map((v) => v.name).join("、")
	}, [initialVersionOrder, compareVersions])

	// 獲取所有版本共同擁有的模型
	const getCommonModels = () => {
		if (compareVersions.length === 0) return []

		const allModels = new Set<string>()
		compareVersions.forEach((version) => {
			version.selectedModels.forEach((model) => allModels.add(model))
		})

		return Array.from(allModels)
	}

	const commonModels = getCommonModels()

	const handleModelChange = (versionId: string, modelId: string) => {
		setSelectedModels((prev) => ({
			...prev,
			[versionId]: modelId,
		}))
	}

	const handleGlobalModelChange = (modelId: string) => {
		setGlobalModelFilter(modelId)
		if (modelId !== "all") {
			const newSelectedModels: { [versionId: string]: string } = {}
			compareVersions.forEach((version) => {
				if (version.selectedModels.includes(modelId)) {
					newSelectedModels[version.id] = modelId
				} else {
					newSelectedModels[version.id] = version.selectedModels[0] || "gpt-4o"
				}
			})
			setSelectedModels(newSelectedModels)
		}
	}

	const handleSendMessage = async () => {
		if (!inputMessage.trim()) return

		const message = inputMessage
		setInputMessage("")

		// 為每個版本的每個模型添加用戶消息
		const updatedVersions = compareVersions.map((version) => {
			const selectedModel = selectedModels[version.id] || version.selectedModels[0] || "gpt-4o"
			const updatedModelResponses = version.modelResponses.map((modelResponse) => {
				if (modelResponse.id === selectedModel) {
					const messageId = `${Date.now()}-${Math.random()}`
					return {
						...modelResponse,
						messages: [
							...modelResponse.messages,
							{
								role: "user" as const,
								content: message,
								id: messageId,
							},
						],
						isLoading: true,
					}
				}
				return modelResponse
			})

			return {
				...version,
				modelResponses: updatedModelResponses,
			}
		})

		onUpdateVersions(updatedVersions)

		// 模擬 AI 回覆
		setTimeout(
			() => {
				const finalUpdatedVersions = updatedVersions.map((version, versionIndex) => {
					const selectedModel = selectedModels[version.id] || version.selectedModels[0] || "gpt-4o"
					const updatedModelResponses = version.modelResponses.map((modelResponse) => {
						if (modelResponse.id === selectedModel) {
							const mockResponse = `Response from ${modelResponse.name} (Version: ${version.name}): ${message}`
							const responseId = `${Date.now()}-${Math.random()}-response`

							return {
								...modelResponse,
								messages: [
									...modelResponse.messages,
									{
										role: "assistant" as const,
										content: mockResponse,
										model: modelResponse.name,
										id: responseId,
									},
								],
								isLoading: false,
							}
						}
						return modelResponse
					})

					return {
						...version,
						modelResponses: updatedModelResponses,
					}
				})

				onUpdateVersions(finalUpdatedVersions)

				// 滾動到底部
				setTimeout(() => {
					scrollRefs.current.forEach((ref) => {
						if (ref) {
							ref.scrollTop = ref.scrollHeight
						}
					})
				}, 100)
			},
			1000 + Math.random() * 1000,
		)
	}

	const handleMessageRating = (versionId: string, messageId: string, rating: "good" | "bad") => {
		const updatedVersions = compareVersions.map((version) => {
			if (version.id === versionId) {
				const updatedModelResponses = version.modelResponses.map((modelResponse) => ({
					...modelResponse,
					messages: modelResponse.messages.map((msg) => (msg.id === messageId ? { ...msg, rating } : msg)),
				}))
				return { ...version, modelResponses: updatedModelResponses }
			}
			return version
		})
		onUpdateVersions(updatedVersions)
	}

	const handlePopupWindow = (versionName: string, modelId: string, messages: Message[]) => {
		const htmlContent = `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${versionName} - ${modelId}</title>
      <style>
        body {
          margin: 0;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #000;
          color: #fff;
          line-height: 1.6;
        }
        .header {
          border-bottom: 1px solid #374151;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .version-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .subtitle {
          color: #9CA3AF;
          font-size: 14px;
        }
        .messages {
          max-width: 800px;
          margin: 0 auto;
        }
        .message {
          margin-bottom: 16px;
          padding: 12px 16px;
          border-radius: 8px;
          max-width: 80%;
        }
        .user-message {
          background: #2563EB;
          margin-left: auto;
          text-align: right;
        }
        .assistant-message {
          background: #374151;
          border: 1px solid #4B5563;
          margin-right: auto;
        }
        .message-content {
          white-space: pre-wrap;
          font-size: 14px;
        }
        .no-messages {
          text-align: center;
          color: #9CA3AF;
          padding: 40px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="version-name">${versionName} - ${modelId}</div>
        <div class="subtitle">版本比較 - 獨立視窗</div>
      </div>
      <div class="messages">
        ${
			messages.length === 0
				? '<div class="no-messages">尚無對話記錄</div>'
				: messages
					.map(
						(message) => `
            <div class="message ${message.role === "user" ? "user-message" : "assistant-message"}">
              <div class="message-content">${message.content}</div>
            </div>
          `,
					)
					.join("")
		}
      </div>
    </body>
    </html>
  `

		const newWindow = window.open("", "_blank")
		if (newWindow) {
			newWindow.document.write(htmlContent)
			newWindow.document.close()
		}
	}

	const handleFullscreen = (versionId: string) => {
		setFullscreenVersion(versionId)
	}

	const handleDragStart = (e: React.DragEvent, version: SavedVersion) => {
		setDraggedItem(version)
		e.dataTransfer.effectAllowed = "move"
	}

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault()
		e.dataTransfer.dropEffect = "move"
		setDragOverIndex(index)
	}

	const handleDragLeave = () => {
		setDragOverIndex(null)
	}

	const handleDrop = (e: React.DragEvent, dropIndex: number) => {
		e.preventDefault()
		if (!draggedItem) return

		const dragIndex = compareVersions.findIndex((v) => v.id === draggedItem.id)
		if (dragIndex === dropIndex) return

		const newVersions = [...compareVersions]
		newVersions.splice(dragIndex, 1)
		newVersions.splice(dropIndex, 0, draggedItem)

		onVersionReorder(newVersions)
		setDraggedItem(null)
		setDragOverIndex(null)
	}

	const handleDragEnd = () => {
		setDraggedItem(null)
		setDragOverIndex(null)
	}

	const getColumnWidthPercent = () => {
		const actualWidth = 28 * (columnWidth / 100)
		return `${actualWidth}%`
	}

	const getContainerClass = () => {
		const count = compareVersions.length
		if (count > 3) {
			return "flex gap-4 h-full overflow-x-auto scrollbar-hide pb-4"
		}
		return "flex gap-4 h-full"
	}

	const getContainerMinWidth = () => {
		const actualWidthPercent = 28 * (columnWidth / 100)
		return compareVersions.length > 3 ? `${compareVersions.length * actualWidthPercent}%` : "100%"
	}

	const getColorModeIcon = () => {
		switch (colorMode) {
			case 1:
				return <Palette className="w-4 h-4" />
			case 2:
				return <PaintBucket className="w-4 h-4" />
			default:
				return <Eye className="w-4 h-4" />
		}
	}

	const getColorModeTooltip = () => {
		switch (colorMode) {
			case 1:
				return "邊框模式"
			case 2:
				return "背景模式"
			default:
				return "無顏色模式"
		}
	}

	return (
		<>
			<TooltipProvider>
				<motion.div
					initial={{ x: 20, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ duration: 0.3, delay: 0.2 }}
					className="flex-1 flex flex-col bg-black p-4 overflow-hidden"
					style={{ paddingBottom: "100px" }} // 為固定輸入框留出空間
				>
					<div className="mb-4 flex justify-between items-center">
						<div>
							<div className="flex items-center space-x-3">
								<h2 className="text-lg font-semibold text-white">版本比較對話框</h2>

								{/* 全局模型篩選 */}
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
											<Button
												variant="outline"
												size="sm"
												className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
											>
												<Filter className="w-4 h-4 mr-2" />
												{globalModelFilter === "all" ? "全部模型" : globalModelFilter}
												<ChevronDown className="w-4 h-4 ml-2" />
											</Button>
										</motion.div>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="bg-gray-900 border-gray-700">
										<DropdownMenuItem
											onClick={() => handleGlobalModelChange("all")}
											className="text-white hover:bg-gray-800 transition-colors"
										>
											全部模型
										</DropdownMenuItem>
										{commonModels.map((modelId) => (
											<DropdownMenuItem
												key={modelId}
												onClick={() => handleGlobalModelChange(modelId)}
												className="text-white hover:bg-gray-800 transition-colors"
											>
												{modelId}
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>

								<Tooltip>
									<TooltipTrigger asChild>
										<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
											<Button
												variant="ghost"
												size="sm"
												onClick={onColorModeChange}
												className={`transition-colors ${
													colorMode > 0
														? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
														: "text-gray-300 hover:text-white hover:bg-gray-900"
												}`}
											>
												{getColorModeIcon()}
											</Button>
										</motion.div>
									</TooltipTrigger>
									<TooltipContent side="bottom" className="z-[9999] bg-gray-800 border-gray-700 text-white">
										<p>{getColorModeTooltip()}</p>
									</TooltipContent>
								</Tooltip>

								{/* 寬度調整滑桿 */}
								<div className="flex items-center space-x-3">
									<span className="text-sm text-gray-400">寬度:</span>
									<div className="flex items-center space-x-2">
										<span className="text-xs text-gray-400 min-w-[2rem]">50%</span>
										<Slider
											value={[columnWidth]}
											onValueChange={(value) => setColumnWidth(value[0])}
											max={200}
											min={50}
											step={5}
											className="w-24 [&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-blue-500 [&_.bg-primary]:bg-blue-500"
										/>
										<span className="text-xs text-gray-400 min-w-[2rem]">200%</span>
									</div>
									<span className="text-xs text-gray-300 min-w-[3rem] text-center">{columnWidth}%</span>
								</div>
							</div>
							<p className="text-sm text-gray-400">
								比較 {compareVersions.length} 個版本的設定（{displayVersionNames}）
							</p>
						</div>
					</div>

					<div className="flex-1 overflow-hidden">
						<div
							className={getContainerClass()}
							style={{
								minWidth: getContainerMinWidth(),
								height: `${chatHeight - 80}px`,
							}}
						>
							{compareVersions.map((version, versionIndex) => {
								const colorConfig = versionColors[versionColorMap[version.id]]
								const selectedModel = selectedModels[version.id] || version.selectedModels[0] || "gpt-4o"
								const isDragOver = dragOverIndex === versionIndex
								const isDragging = draggedItem?.id === version.id

								// 獲取選中模型的對話內容
								const modelMessages = version.modelResponses?.find((m) => m.id === selectedModel)?.messages || []

								// 如果全局篩選不是 "all" 且該版本沒有選中的模型，則不顯示
								if (globalModelFilter !== "all" && !version.selectedModels.includes(globalModelFilter)) {
									return null
								}

								return (
									<motion.div
										key={version.id}
										initial={{ y: 20, opacity: 0 }}
										animate={{
											y: 0,
											opacity: isDragging ? 0.5 : 1,
											scale: isDragOver ? 1.02 : 1,
										}}
										transition={{ delay: versionIndex * 0.1, duration: 0.3 }}
										className="flex-shrink-0"
										style={{ width: getColumnWidthPercent() }}
										draggable
										onDragStart={(e) => handleDragStart(e, version)}
										onDragOver={(e) => handleDragOver(e, versionIndex)}
										onDragLeave={handleDragLeave}
										onDrop={(e) => handleDrop(e, versionIndex)}
										onDragEnd={handleDragEnd}
									>
										<Card
											className={`flex flex-col h-full transition-all duration-200 ${
												colorMode === 1
													? `bg-gray-900 border-2 ${colorConfig.border}`
													: colorMode === 2
														? `${colorConfig.bg} border-gray-800`
														: "bg-gray-900 border-gray-800"
											} ${isDragOver ? "ring-2 ring-blue-500" : ""}`}
										>
											{/* 可拖動的標題區域 */}
											<div className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-800 flex-shrink-0 cursor-move hover:bg-gray-700 transition-colors">
												<div className="flex items-center space-x-2">
													<GripVertical className="w-4 h-4 text-gray-400" />
													<Badge variant="outline" className={`text-white border-gray-600 ${colorConfig.badge}`}>
														{version.name}
													</Badge>
												</div>
												<div className="flex space-x-1">
													<div className="text-xs text-green-400 font-mono mr-2 pt-[5] text-center leading-[1.6rem]">
														{(95.0 + Math.random() * 5).toFixed(1)}%
													</div>
													<Tooltip>
														<TooltipTrigger asChild>
															<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
																<Button
																	variant="ghost"
																	size="sm"
																	className="h-8 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
																	onClick={() => handlePopupWindow(version.name, selectedModel, modelMessages)}
																>
																	<ExternalLink className="w-3 h-3" />
																</Button>
															</motion.div>
														</TooltipTrigger>
														<TooltipContent side="bottom" className="z-[9999] bg-gray-800 border-gray-700 text-white">
															<p>彈出視窗</p>
														</TooltipContent>
													</Tooltip>
													<Tooltip>
														<TooltipTrigger asChild>
															<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
																<Button
																	variant="ghost"
																	size="sm"
																	className="h-8 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
																	onClick={() => handleFullscreen(version.id)}
																>
																	<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth={2}
																			d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
																		/>
																	</svg>
																</Button>
															</motion.div>
														</TooltipTrigger>
														<TooltipContent side="bottom" className="z-[9999] bg-gray-800 border-gray-700 text-white">
															<p>全螢幕</p>
														</TooltipContent>
													</Tooltip>
												</div>
											</div>

											{/* 模型選擇下拉選單 */}
											<div className="p-3 border-b border-gray-800 bg-gray-800 flex-shrink-0">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="outline"
															className="w-full justify-between bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
														>
															{selectedModel}
															<ChevronDown className="w-4 h-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent className="bg-gray-900 border-gray-700">
														{version.selectedModels.map((modelId) => (
															<DropdownMenuItem
																key={modelId}
																onClick={() => handleModelChange(version.id, modelId)}
																className="text-white hover:bg-gray-800 transition-colors"
															>
																{modelId}
															</DropdownMenuItem>
														))}
													</DropdownMenuContent>
												</DropdownMenu>
											</div>

											{/* 對話內容區域 */}
											<div
												ref={(el) => (scrollRefs.current[versionIndex] = el)}
												className="flex-1 p-3 overflow-y-auto space-y-3 min-h-0"
											>
												{modelMessages.length === 0 ? (
													<div className="text-center text-gray-400 py-8">
														<p>尚無對話記錄</p>
														<p className="text-xs mt-2">版本: {version.name}</p>
														<p className="text-xs">模型: {selectedModel}</p>
													</div>
												) : (
													modelMessages.map((message, msgIndex) => (
														<MessageBubble
															key={msgIndex}
															message={message}
															index={msgIndex}
															onRating={(messageId, rating) => handleMessageRating(version.id, messageId, rating)}
															showRating={message.role === "assistant"}
														/>
													))
												)}
											</div>
										</Card>
									</motion.div>
								)
							})}
						</div>
					</div>

					{/* 全螢幕模式 */}
					{fullscreenVersion && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="fixed top-0 left-0 right-0 bottom-0 z-[70] bg-black/90 backdrop-blur-sm"
						>
							<motion.div
								initial={{ scale: 0.95, opacity: 0, y: 20 }}
								animate={{ scale: 1, opacity: 1, y: 0 }}
								exit={{ scale: 0.95, opacity: 0, y: 20 }}
								transition={{
									duration: 0.3,
									type: "spring",
									stiffness: 300,
									damping: 30,
								}}
								className="h-full p-4 pt-20"
							>
								<Card className="h-full bg-gray-900 border-gray-800 flex flex-col shadow-2xl">
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.1, duration: 0.2 }}
										className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-800"
									>
										<h3 className="font-medium text-white">
											{compareVersions.find((v) => v.id === fullscreenVersion)?.name} - 全螢幕檢視
										</h3>
										<div className="flex items-center space-x-2">
											<div className="text-xs text-green-400 font-mono">{(95.0 + Math.random() * 5).toFixed(1)}%</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setFullscreenVersion(null)}
												className="text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
											>
												<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M6 18L18 6M6 6l12 12"
														/>
													</svg>
												</motion.div>
											</Button>
										</div>
									</motion.div>
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.2, duration: 0.3 }}
										className="flex-1 p-3 overflow-y-auto space-y-3"
									>
										{compareVersions
											.find((v) => v.id === fullscreenVersion)
											?.modelResponses?.find((m) => m.id === selectedModels[fullscreenVersion])
											?.messages.map((message, msgIndex) => (
												<MessageBubble
													key={msgIndex}
													message={message}
													index={msgIndex}
													onRating={(messageId, rating) => handleMessageRating(fullscreenVersion, messageId, rating)}
													showRating={message.role === "assistant"}
												/>
											)) || (
											<div className="text-center text-gray-400 py-8">
												<p>尚無對話記錄</p>
											</div>
										)}
									</motion.div>
								</Card>
							</motion.div>
						</motion.div>
					)}
				</motion.div>
			</TooltipProvider>

			{/* 聊天輸入框 - 完全獨立的固定浮動視窗 */}
			<motion.div
				initial={{ y: 100, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.5, duration: 0.3 }}
				className="fixed bottom-0 left-0 right-0 z-[9999] bg-black/95 backdrop-blur-md border-t border-gray-700 shadow-2xl"
				style={{
					position: "fixed",
					bottom: 0,
					left: 0,
					right: 0,
					zIndex: 9999,
				}}
			>
				<div className="max-w-7xl mx-auto p-4">
					<div className="flex space-x-3">
						<Input
							value={inputMessage}
							onChange={(e) => setInputMessage(e.target.value)}
							placeholder="輸入訊息進行比較測試..."
							className="flex-1 bg-gray-900/90 border-gray-600 text-white h-12 text-base focus:border-blue-500 focus:ring-blue-500 transition-colors backdrop-blur-sm"
							onKeyPress={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault()
									handleSendMessage()
								}
							}}
						/>
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button
								onClick={handleSendMessage}
								size="lg"
								className="h-12 px-6 bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg"
								disabled={!inputMessage.trim()}
							>
								<Send className="w-5 h-5" />
							</Button>
						</motion.div>
					</div>
				</div>
			</motion.div>
		</>
	)
}
