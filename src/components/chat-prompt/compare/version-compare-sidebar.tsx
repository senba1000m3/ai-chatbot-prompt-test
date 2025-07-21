"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { X, ChevronRight, GripVertical } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { usePromptStore, type SavedVersion } from "@/lib/store/prompt"

interface Model {
  id: string
  name: string
  category: string
}

interface Tool {
  id: string
  name: string
}

interface VersionCompareSidebarProps {
  availableModels: Model[]
  availableTools: Tool[]
  onVersionReorder: (newOrder: SavedVersion[]) => void
  colorMode: number
}

const versionColors = [
  { border: "border-blue-500", bg: "bg-blue-900/20", badge: "bg-blue-600" },
  { border: "border-green-500", bg: "bg-green-900/20", badge: "bg-green-600" },
  { border: "border-purple-500", bg: "bg-purple-900/20", badge: "bg-purple-600" },
  { border: "border-orange-500", bg: "bg-orange-900/20", badge: "bg-orange-600" },
  { border: "border-pink-500", bg: "bg-pink-900/20", badge: "bg-pink-600" },
]

export function VersionCompareSidebar({
  availableModels,
  availableTools,
  colorMode,
}: VersionCompareSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set())
  const [draggedItem, setDraggedItem] = useState<SavedVersion | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

	const { compareVersions, setCompareVersions, setIsInCompareView, setIsCompareMode, clearCompareSelectedVersions, setShowVersionHistory,
		compareVersionsOrder, setInitialVersionOrder, onVersionReorder, clearCompareModelMessages } = usePromptStore();

	const sortedVersions = useMemo(() => {
		if (compareVersionsOrder.length === 0 || compareVersions.length === 0) {
			return compareVersions
		}
		const versionMap = new Map(compareVersions.map((v) => [v.id, v]))
		return compareVersionsOrder
			.map((id) => versionMap.get(id))
			.filter((v): v is SavedVersion => !!v)
	}, [compareVersions, compareVersionsOrder])

	const handleExitCompare = () => {
		setIsInCompareView(false);
		setIsCompareMode(false);
		clearCompareSelectedVersions();
		clearCompareModelMessages();
		setCompareVersions([]);
		setInitialVersionOrder([]);
		setShowVersionHistory(true);
	}

  const versionColorMap = useMemo(() => {
    const colorMap: { [versionId: string]: number } = {}
    const sortedVersions = [...compareVersions].sort((a, b) => a.id.localeCompare(b.id))

    sortedVersions.forEach((version, index) => {
      colorMap[version.id] = index % versionColors.length
    })

    return colorMap
  }, [compareVersions])

  const toggleVersionExpanded = (versionId: string) => {
    setExpandedVersions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(versionId)) {
        newSet.delete(versionId)
      } else {
        newSet.add(versionId)
      }
      return newSet
    })
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

    const newOrder = [...sortedVersions]
    const dragIndex = newOrder.findIndex((v) => v.id === draggedItem.id)
    if (dragIndex === -1) return

    onVersionReorder(dragIndex, dropIndex);
    setDraggedItem(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverIndex(null)
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ width: 60, opacity: 0 }}
        animate={{ width: isExpanded ? 400 : 60, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="border-r border-gray-800 bg-black flex flex-col overflow-hidden"
      >
        {/* 標題區域 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="p-4 border-b border-gray-800 flex items-center justify-between"
        >
          {isExpanded ? (
            <>
              <h2 className="text-lg font-semibold text-white">版本比較資訊</h2>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800">
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </AlertDialogTrigger>
                <AlertDialogContent
                  className="bg-black border-gray-800"
                  onEscapeKeyDown={(event) => {
                    event.preventDefault()
                  }}
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">結束比較</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                      確定要結束版本比較嗎？這將會返回到版本歷史列表。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex justify-center space-x-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <AlertDialogAction onClick={handleExitCompare} className="bg-red-600 hover:bg-red-700">
                        確認結束
                      </AlertDialogAction>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <AlertDialogCancel className="text-gray-300 border-gray-800 hover:bg-gray-900">
                        取消
                      </AlertDialogCancel>
                    </motion.div>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                  className="text-gray-400 hover:text-white hover:bg-gray-800 p-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* 收起狀態的版本指示器 */}
        {!isExpanded && (
          <div className="flex-1 p-2 space-y-2">
            {sortedVersions.map((version, index) => {
              const colorConfig = versionColors[versionColorMap[version.id]]

              return (
                <Tooltip key={version.id}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${colorConfig.badge} cursor-pointer hover:scale-110 transition-transform`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, version)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      {version.name.charAt(0)}
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="z-[999999] bg-gray-800 border-gray-700 text-white min-w-lg fixed"
                    sideOffset={15}
                    style={{
                      zIndex: 999999,
                      position: "fixed",
                    }}
                  >
                    <div className="space-y-2">
                      <div className="font-medium">{version.name}</div>
                      <div className="text-xs text-gray-300">{version.savedAt.toLocaleString()}</div>

                      <div>
                        <div className="text-xs text-gray-400 mb-1">System Prompt:</div>
                        <div className="text-xs text-gray-300 space-y-1">
                          {version.data?.systemPrompt ? (
                            <>
                              <div>
                                <span className="text-gray-400">角色設定:</span>{" "}
                                {version.data.systemPrompt.characterSettings || "無"}
                              </div>
                              <div>
                                <span className="text-gray-400">自我認知:</span>{" "}
                                {version.data.systemPrompt.selfAwareness || "無"}
                              </div>
                              <div>
                                <span className="text-gray-400">任務流程:</span>{" "}
                                {version.data.systemPrompt.workflow || "無"}
                              </div>
                              <div>
                                <span className="text-gray-400">格式限制:</span>{" "}
                                {version.data.systemPrompt.formatLimits || "無"}
                              </div>
                              <div>
                                <span className="text-gray-400">工具使用:</span>{" "}
                                {version.data.systemPrompt.usedTools || "無"}
                              </div>
                              <div>
                                <span className="text-gray-400">回覆限制:</span>{" "}
                                {version.data.systemPrompt.repliesLimits || "無"}
                              </div>
                              <div>
                                <span className="text-gray-400">防洩漏:</span>{" "}
                                {version.data.systemPrompt.preventLeaks || "無"}
                              </div>
                            </>
                          ) : (
                            <div className="text-gray-500">舊版本格式</div>
                          )}
                        </div>
                      </div>

                      {/* Default Hint Messages */}
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Default Hint Messages:</div>
                        <div className="text-xs text-gray-300 max-h-20 overflow-y-auto bg-gray-900 p-2 rounded border border-gray-700">
                          {version.data.hintMessage.length > 0 ? (
							  version.data.hintMessage.map((msg, idx) => (
                              <div key={msg.id || idx}>
                                {idx + 1}. {msg.content || "無內容"}
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-500">無數據</div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">Temperature:</span>
                          <span className="text-white ml-1">{version.data.parameters.temperature}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Batch Size:</span>
                          <span className="text-white ml-1">{version.data.parameters.batchSize}</span>
                        </div>
                      </div>

                      <div className="text-xs">
                        <span className="text-gray-400">Models:</span>
                        <span className="text-white ml-1">{version.data.models.join(", ") || "無"}</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        )}

        {/* 展開狀態的詳細內容 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  收起
                </Button>
              </div>

              <AnimatePresence>
                {sortedVersions.map((version, index) => {
                  const colorConfig = versionColors[versionColorMap[version.id]]
                  const isVersionExpanded = expandedVersions.has(version.id)
                  const isDragOver = dragOverIndex === index
                  const isDragging = draggedItem?.id === version.id

                  return (
                    <motion.div
                      key={version.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{
                        x: 0,
                        opacity: isDragging ? 0.5 : 1,
                        scale: isDragOver ? 1.02 : 1,
                      }}
                      exit={{ x: -20, opacity: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, version)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <Card
                        className={`p-4 cursor-pointer transition-all duration-200 ${
                          colorMode === 1
                            ? `bg-gray-900 border-2 ${colorConfig.border}`
                            : colorMode === 2
                              ? `${colorConfig.bg} border-gray-800`
                              : "bg-gray-900 border-gray-800"
                        } ${isDragOver ? "ring-2 ring-blue-500" : ""}`}
                        onClick={() => toggleVersionExpanded(version.id)}
                      >
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                              <h3 className="font-medium text-white">{version.name}</h3>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="outline"
                                className={`text-xs text-white border-gray-600 ${colorConfig.badge}`}
                              >
                                {version.name}
                              </Badge>
                              <motion.div
                                animate={{ rotate: isVersionExpanded ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </motion.div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400">{version.savedAt.toLocaleString()}</p>
                        </div>

                        <AnimatePresence>
                          {isVersionExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {/* System Prompt sections */}
                              <div>
                                <div className="text-xs text-gray-400 mb-1">System Prompt:</div>
                                <div className="text-xs text-gray-300 space-y-1">
                                  {version.data?.systemPrompt ? (
                                    <>
                                      <div>
                                        <span className="text-gray-400">角色設定:</span>{" "}
                                        {version.data.systemPrompt.characterSettings || "無"}
                                      </div>
                                      <div>
                                        <span className="text-gray-400">自我認知:</span>{" "}
                                        {version.data.systemPrompt.selfAwareness || "無"}
                                      </div>
                                      <div>
                                        <span className="text-gray-400">任務流程:</span>{" "}
                                        {version.data.systemPrompt.workflow || "無"}
                                      </div>
                                      <div>
                                        <span className="text-gray-400">格式限制:</span>{" "}
                                        {version.data.systemPrompt.formatLimits || "無"}
                                      </div>
                                      <div>
                                        <span className="text-gray-400">工具使用:</span>{" "}
                                        {version.data.systemPrompt.usedTools || "無"}
                                      </div>
                                      <div>
                                        <span className="text-gray-400">回覆限制:</span>{" "}
                                        {version.data.systemPrompt.repliesLimits || "無"}
                                      </div>
                                      <div>
                                        <span className="text-gray-400">防洩漏:</span>{" "}
                                        {version.data.systemPrompt.preventLeaks || "無"}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-gray-500">舊版本格式</div>
                                  )}
                                </div>
                              </div>

                              {/* Default Hint Messages */}
                              <div>
                                <div className="text-xs text-gray-400 mb-1">Default Hint Messages:</div>
                                <div className="text-xs text-gray-300 max-h-20 overflow-y-auto bg-gray-900 p-2 rounded border border-gray-700">
                                  {version.data.hintMessage.length > 0 ? (
                                    version.data.hintMessage.map((msg, idx) => (
                                      <div key={msg.id || idx}>
                                        {idx + 1}. {msg.content || "無內容"}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-gray-500">無數據</div>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-gray-400">Temperature:</span>
                                  <span className="text-white ml-1">{version.data.parameters.temperature}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Batch Size:</span>
                                  <span className="text-white ml-1">{version.data.parameters.batchSize}</span>
                                </div>
                              </div>

                              <div className="text-xs">
                                <span className="text-gray-400">Models:</span>
                                <span className="text-white ml-1">{version.data.models.join(", ") || "無"}</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  )
}
