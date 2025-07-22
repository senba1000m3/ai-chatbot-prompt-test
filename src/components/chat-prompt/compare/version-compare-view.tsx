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
import { ExternalLink, ChevronDown, GripVertical, Palette, PaintBucket, Eye, Filter, Search, Send } from "lucide-react"
import { useState, useMemo, useRef, useEffect, createRef } from "react"
import { MessageBubble } from "../chat/message-bubble"
import { usePromptStore, type SavedVersion, type ModelMessage, type ModelAccuracy, availableModels } from "@/lib/store/prompt"
import { useComparePromptChat } from "@/hooks/use-compare-prompt-chat"

interface VersionCompareViewProps {
  chatHeight: number
  colorMode: number
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
  { border: "border-pink-500", bg: "bg-pink-S900/20", badge: "bg-pink-600" },
]

// 按分類分組模型
const getModelsByCategory = () => {
  const categories: { [key: string]: typeof availableModels } = {}
  availableModels.forEach((model) => {
    if (!categories[model.category]) {
      categories[model.category] = []
    }
    categories[model.category].push(model)
  })
  return categories
}

const modelsByCategory = getModelsByCategory()

export function VersionCompareView({
  chatHeight,
  colorMode,
  onColorModeChange,
  initialVersionOrder,
  onUpdateVersions,
}: VersionCompareViewProps) {
  const {
    compareVersions,
    compareVersionsOrder,
    onVersionReorder,
	compareModelMessages,
	compareSelectedModel,
	setCompareSelectedModel,
	updateVersionAccuracy,
	modelMessages
  } = usePromptStore()
	const { handleSubmit } = useComparePromptChat();

  const sortedVersions = useMemo(() => {
    if (compareVersionsOrder.length === 0 || compareVersions.length === 0) {
      return compareVersions
    }
    const versionMap = new Map(compareVersions.map((v) => [v.id, v]))
    return compareVersionsOrder
      .map((id) => versionMap.get(id))
      .filter((v): v is SavedVersion => !!v)
  }, [compareVersions, compareVersionsOrder])

	const scrollRefs = useMemo(() => sortedVersions.map(() => createRef<HTMLDivElement>()), [sortedVersions.length, sortedVersions]);

	useEffect(() => {
		scrollRefs.forEach(ref => {
			if (ref.current) {
				ref.current.scrollTop = ref.current.scrollHeight;
			}
		});
	}, [compareModelMessages, sortedVersions.map(v => compareModelMessages[v.id]?.[compareSelectedModel]?.length).join(","), scrollRefs]);

  const [globalModelFilter, setGlobalModelFilter] = useState<string>("gpt-4o")
  const [modelSearchQuery, setModelSearchQuery] = useState("")
  const [draggedItem, setDraggedItem] = useState<SavedVersion | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [fullscreenVersion, setFullscreenVersion] = useState<string | null>(null)
  const [columnWidth, setColumnWidth] = useState(() => {
    return sortedVersions.length === 2 ? 125 : 85
  })

  // 聊天輸入相關狀態
  const [inputMessage, setInputMessage] = useState("")

  // 為每個版本分配固定的顏色索引，基於版本ID而不是當前位置
  const versionColorMap = useMemo(() => {
    const colorMap: { [versionId: string]: number } = {}
    const versions = [...sortedVersions].sort((a, b) => a.id.localeCompare(b.id))

    versions.forEach((version, index) => {
      colorMap[version.id] = index % versionColors.length
    })

    return colorMap
  }, [sortedVersions])

  // 使用初始順序來顯示版本名稱，如果沒有提供則使用當前順序
  const displayVersionNames = useMemo(() => {
    const versionsForDisplay = initialVersionOrder || sortedVersions
    return versionsForDisplay.map((v) => v.name).join("、")
  }, [initialVersionOrder, sortedVersions])

  // 獲取所有版本共同擁有的模型
  const getCommonModels = () => {
    if (sortedVersions.length === 0) return []

    const allModels = new Set<string>()
    sortedVersions.forEach((version) => {
      const models = version.data?.models || []
      models.forEach((model) => allModels.add(model))
    })

    return Array.from(allModels)
  }

  const commonModels = getCommonModels()

  // 篩選模型列表
  const filteredModels = useMemo(() => {
    return availableModels.filter(
      (model) =>
        model.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
        model.id.toLowerCase().includes(modelSearchQuery.toLowerCase()),
    )
  }, [modelSearchQuery])

  const handleGlobalModelChange = (modelId: string) => {
    setGlobalModelFilter(modelId)
	setCompareSelectedModel(modelId);
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return
	handleSubmit(inputMessage);
    setInputMessage("")
  }

  const handleMessageRating = (versionId: string, modelId: string, messageId: string, rating: "good" | "bad") => {

  }
  //
  const handlePopupWindow = (versionName: string, modelId: string, messages: ModelMessage[]) => {
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
              <div class="message-content">${message}</div>
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
  //
  const handleFullscreen = (versionId: string) => {
    setFullscreenVersion(versionId)
  }

  const handleDragStart = (e: any, version: SavedVersion) => {
    setDraggedItem(version)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: any, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: any, dropIndex: number) => {
    e.preventDefault()
    if (!draggedItem) return

    const dragIndex = sortedVersions.findIndex((v) => v.id === draggedItem.id)
    if (dragIndex === -1) return

    onVersionReorder(dragIndex, dropIndex)
    setDraggedItem(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverIndex(null)
  }

  const getColumnWidthPercent = () => {
    const actualWidth = 38 * (columnWidth / 100)
    return `${actualWidth}%`
  }

  const getContainerClass = () => {
    const count = sortedVersions.length
    if (count > 3) {
      return "flex gap-4 h-full overflow-x-auto scrollbar-hide pb-4"
    }
    return "flex gap-4 h-full"
  }

  const getContainerMinWidth = () => {
    const actualWidthPercent = 28 * (columnWidth / 100)
    return sortedVersions.length > 3 ? `${sortedVersions.length * actualWidthPercent}%` : "100%"
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

  // const handleUpdateCompareVersions = (updatedVersions: SavedVersion[]) => {
  //   updateCompareVersions(updatedVersions)
  // }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex-1 flex flex-col bg-black p-4 overflow-hidden"
        style={{ paddingBottom: "80px" }}
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
                <DropdownMenuContent className="bg-gray-900 border-gray-700 w-80">
                  {/* 搜尋框 */}
                  <div className="p-2 border-b border-gray-700">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="搜尋模型..."
                        value={modelSearchQuery}
                        onChange={(e) => setModelSearchQuery(e.target.value)}
                        className="pl-8 bg-gray-800 border-gray-600 text-white text-sm h-8"
                      />
                    </div>
                  </div>
                  {/*<DropdownMenuItem*/}
                  {/*  onClick={() => handleGlobalModelChange("all")}*/}
                  {/*  className="text-white hover:bg-gray-800 transition-colors"*/}
                  {/*>*/}
                  {/*  全部模型*/}
                  {/*</DropdownMenuItem>*/}

                  {/* 按分類顯示模型 */}
                  {Object.entries(modelsByCategory).map(([category, categoryModels]) => {
                    const filteredCategoryModels = categoryModels.filter(
                      (model) =>
                        model.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
                        model.id.toLowerCase().includes(modelSearchQuery.toLowerCase()),
                    )

                    if (filteredCategoryModels.length === 0) return null

                    return (
                      <div key={category}>
                        <div className="px-2 py-1 text-xs font-semibold text-gray-400 bg-gray-800 border-t border-gray-700">
                          {category}
                        </div>
                        {filteredCategoryModels.map((model) => (
                          <DropdownMenuItem
                            key={model.id}
                            onClick={() => handleGlobalModelChange(model.id)}
                            className="text-white hover:bg-gray-800 transition-colors pl-4"
                          >
                            <div className="flex flex-col">
                              <span>{model.name}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    )
                  })}
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
            <p className="text-sm mt-[10px] text-gray-400">
              比較 {sortedVersions.length} 個版本的設定（{sortedVersions.map((version) =>{return version.name}).join("、")}）
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
            {sortedVersions.map((version, versionIndex) => {

			  const colorConfig = versionColors[versionColorMap[version.id]]
              const isDragOver = dragOverIndex === versionIndex
              const isDragging = draggedItem?.id === version.id

              // 將訊息相關變數定義在頂部
              const messages = (compareSelectedModel && compareModelMessages[version.id]?.[compareSelectedModel]) || {};
              const messageList = Object.values(messages);

              // 獲取該模型的準確率
			  const modelAccuracy: number = version.modelAccuracy?.find((acc) => acc.model === compareSelectedModel)?.accuracy || -1;

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
                  style={{ width: getColumnWidthPercent(), height: "85%" }}
                >
                  <Card
                    className={`flex flex-col transition-all duration-200 h-[150%] ${
                      colorMode === 1
                        ? `bg-gray-900 border-2 ${colorConfig.border}`
                        : colorMode === 2
                          ? `${colorConfig.bg} border-gray-800`
                          : "bg-gray-900 border-gray-800"
                    } ${isDragOver ? "ring-2 ring-blue-500" : ""}`}
                  >
                    {/* 可拖動的標題區域 */}
                    <div
                      className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-800 flex-shrink-0 cursor-move hover:bg-gray-700 transition-colors"
                      draggable
                      onDragStart={(e) => handleDragStart(e, version)}
                      onDragOver={(e) => handleDragOver(e, versionIndex)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, versionIndex)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex items-center space-x-2">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <Badge variant="outline" className={`text-white border-gray-600 ${colorConfig.badge}`}>
                          {version.name}
                        </Badge>
                      </div>
                      <div className="flex space-x-1">
                        <div className="text-xs text-green-400 font-mono mr-2 pt-[5] text-center leading-[1.6rem]">
                          {modelAccuracy.toFixed(1)}%
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                                onClick={() => handlePopupWindow(version.name, compareSelectedModel, messageList)}
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
                    {/*<div className="p-3 border-b border-gray-800 bg-gray-800 flex-shrink-0">*/}
                    {/*  <DropdownMenu>*/}
                    {/*    <DropdownMenuTrigger asChild>*/}
                    {/*      <Button*/}
                    {/*        variant="outline"*/}
                    {/*        className="w-full justify-between bg-gray-900 border-gray-700 text-white hover:bg-gray-800"*/}
                    {/*      >*/}
                    {/*        {selectedModel}*/}
                    {/*        <ChevronDown className="w-4 h-4" />*/}
                    {/*      </Button>*/}
                    {/*    </DropdownMenuTrigger>*/}
                    {/*    <DropdownMenuContent className="bg-gray-900 border-gray-700">*/}
                    {/*      {models.map((modelId) => (*/}
                    {/*        <DropdownMenuItem*/}
                    {/*          key={modelId}*/}
                    {/*          onClick={() => handleModelChange(version.id, modelId)}*/}
                    {/*          className="text-white hover:bg-gray-800 transition-colors"*/}
                    {/*        >*/}
                    {/*          {modelId}*/}
                    {/*        </DropdownMenuItem>*/}
                    {/*      ))}*/}
                    {/*    </DropdownMenuContent>*/}
                    {/*  </DropdownMenu>*/}
                    {/*</div>*/}

                    {/* 對話內容區域 */}
                    <div
                      ref={scrollRefs[versionIndex]}
                      className="flex-1 p-3 overflow-y-auto space-y-3 min-h-0"
                    >
                      {(() => {
                        if (messageList.length === 0) {
                          return (
                            <div className="text-center text-gray-400 py-8">
                              <p>尚無對話記錄</p>
                              <p className="text-xs mt-2">版本: {version.name}</p>
                              <p className="text-xs">模型: {compareSelectedModel || "N/A"}</p>
                            </div>
                          )
                        }

                        return messageList.map((message, msgIndex) => (
                          <MessageBubble
                            key={message.id || msgIndex}
                            message={message}
                            index={msgIndex}
                            modelId={compareSelectedModel}
                            versionId={version.id}
                            showRating={message.role === "assistant"}
                          />
                        ))
                      })()}
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
                    {sortedVersions.find((v) => v.id === fullscreenVersion)?.name} - 全螢幕檢視
                  </h3>
                  <div className="flex items-center space-x-2">
                    {/*<div className="text-xs text-green-400 font-mono">*/}
                    {/*  {(() => {*/}
                    {/*    const version = sortedVersions.find((v) => v.id === fullscreenVersion)*/}
                    {/*    if (!version) return "N/A"*/}
					{/*	  const modelAccuracy: number = version.modelAccuracy?.find((acc) => acc.model === compareSelectedModel)?.accuracy || -1;*/}
					{/*	  return `${modelAccuracy.toFixed(1)}%`*/}
                    {/*  })()}*/}
                    {/*</div>*/}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFullscreenVersion(null)}
                      className="text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                  {(() => {
                    const version = sortedVersions.find((v) => v.id === fullscreenVersion)
                    if (!version)
                      return (
                        <div className="text-center text-gray-400 py-8">
                          <p>版本不存在</p>
                        </div>
                      )

                    const messages = (compareSelectedModel && compareModelMessages[fullscreenVersion]?.[compareSelectedModel]) || {}
                    const messageList = Object.values(messages)

                    return messageList.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">
                        <p>尚無對話記錄</p>
                      </div>
                    ) : (
                      messageList.map((message, msgIndex) => (
                        <MessageBubble
                          key={message.id || msgIndex}
						  message={message}
						  index={msgIndex}
						  modelId={compareSelectedModel}
						  versionId={fullscreenVersion}
						  showRating={message.role === "assistant"}
                        />
                      ))
                    )
                  })()}
                </motion.div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* 固定在底部的輸入框 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-black/95 backdrop-blur-md">
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
                disabled={!inputMessage.trim() || !compareSelectedModel || compareSelectedModel === 'all'}
              >
                <Send className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
