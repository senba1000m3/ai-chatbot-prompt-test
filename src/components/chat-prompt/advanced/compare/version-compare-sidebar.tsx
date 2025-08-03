"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { Card } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Badge } from "../../../ui/badge"
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
} from "../../../ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../../../ui/tooltip"
import { X, ChevronRight, GripVertical, LogOut, Settings } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { usePromptStore, type SavedVersion } from "../../../../lib/store/prompt"
import { CompareVersionCard } from "./compare-version-card"
import { CompareVersionSelectDialog } from "./compare-version-select-dialog"

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
  colorMode: number
  onColorModeChange: () => void
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
  onColorModeChange,
}: VersionCompareSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set())
  const [draggedItem, setDraggedItem] = useState<SavedVersion | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false)

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
      <div
        className={`flex flex-col w-full${!isExpanded ? " -ml-3" : ""}`}
        style={{ height: "calc(100vh - 80px - 55px)" }}
      >
        <div className="flex flex-1 min-h-0">
          {/* Sidebar 區塊 */}
          <motion.div
            initial={{ width: 60, opacity: 0 }}
            animate={{ width: isExpanded ? 270 : 60, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-r border-gray-800 bg-black flex flex-col overflow-hidden h-full"
            style={{ minWidth: isExpanded ? 270 : 60 }}
          >
            <div className="flex-1 grid grid-rows-[9fr_10fr] min-h-0">
              {/* 上半部：版本比較資訊 */}
              <div className="flex flex-col min-h-0">
                {/* 標題區域 */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className={`px-3 pl-4 border-b border-gray-800 h-12 flex items-center ${isExpanded ? "justify-between" : "justify-center"} flex-shrink-0 w-full`}
                >
                  {isExpanded ? (
                    <>
                      <h2 className="text-base text-white">版本比較資訊</h2>
					  <Button
						variant="ghost"
						size="sm"
						onClick={() =>{setIsSelectDialogOpen(true)}}
						className="text-xs text-gray-400 hover:text-white hover:bg-gray-800 -mr-4 p-2"
					  >
						<Settings className="w-3 h-3" />
						調整
					  </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(false)}
                        className="text-xs text-gray-400 hover:text-white hover:bg-gray-800 p-2"
                      >
                        <ChevronRight className="w-3 h-3 rotate-180" />
                        收起
                      </Button>
                    </>
                  ) : (
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
                  )}
                </motion.div>

                <div className="flex-1 overflow-y-auto">
                  {/* 收起狀態的版本指示器 */}
                  {!isExpanded && (
                    <div className="p-2 space-y-2 flex flex-col items-center">
                      <AnimatePresence>
                        {sortedVersions.map((version, index) => {
                          const colorConfig = versionColors[versionColorMap[version.id]]

                          return (
                            <motion.div
                              key={version.id}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ delay: index * 0.1, duration: 0.3 }}
                              layout
                            >
                              <CollapsedVersionTooltip
                                version={version}
                                colorConfig={colorConfig}
                                index={index}
                                onDragStart={handleDragStart}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onDragEnd={handleDragEnd}
                              />
                            </motion.div>
                          )
                        })}
                      </AnimatePresence>
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
                        className="p-3 space-y-3"
                      >
                        <AnimatePresence>
                          {sortedVersions.map((version, index) => {
                            const colorConfig = versionColors[versionColorMap[version.id]]
                            const isVersionExpanded = expandedVersions.has(version.id)
                            const isDragOver = dragOverIndex === index
                            const isDragging = draggedItem?.id === version.id

                            return (
                              <CompareVersionCard
                                key={version.id}
                                version={version}
                                colorConfig={colorConfig}
                                isExpanded={isVersionExpanded}
                                isDragOver={isDragOver}
                                isDragging={isDragging}
                                onToggleExpand={toggleVersionExpanded}
                                onDragStart={handleDragStart}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onDragEnd={handleDragEnd}
                                index={index}
                              />
                            )
                          })}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* 下半部：預設測試集 */}
              <div className="flex flex-col border-t-2 border-gray-700 min-h-0">
                <div className={`px-3 pl-4 border-b border-gray-800 h-12 flex items-center ${isExpanded ? "justify-between" : "justify-center"} flex-shrink-0`}>
                  {isExpanded ? (
                    <>
                      <h2 className="text-base text-white">預設測試集</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-gray-400 hover:text-white hover:bg-gray-800 p-2"
                      >
                        <Settings className="w-3 h-3" />
                        設定
                      </Button>
                    </>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-white hover:bg-gray-800"
                        >
                          <Settings className="w-5 h-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>設定預設測試集</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  {isExpanded ? (
                    <p className="text-gray-400">這裡是預設測試集的內容。</p>
                  ) : (
                    <div className="text-gray-400 text-center">...</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <CompareVersionSelectDialog isOpen={isSelectDialogOpen} onOpenChange={setIsSelectDialogOpen} />
    </TooltipProvider>
  )
}

interface CollapsedVersionTooltipProps {
  version: SavedVersion
  colorConfig: { badge: string }
  index: number
  onDragStart: (e: React.DragEvent, version: SavedVersion) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, index: number) => void
  onDragEnd: (e: React.DragEvent) => void
}

const CollapsedVersionTooltip: React.FC<CollapsedVersionTooltipProps> = ({
                                                                           version,
                                                                           colorConfig,
                                                                           index,
                                                                           onDragStart,
                                                                           onDragOver,
                                                                           onDragLeave,
                                                                           onDrop,
                                                                           onDragEnd,
                                                                         }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${colorConfig.badge} cursor-pointer hover:scale-110 transition-transform`}
          draggable
          onDragStart={(e) => onDragStart(e, version)}
          onDragOver={(e) => onDragOver(e, index)}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, index)}
          onDragEnd={onDragEnd}
        >
          {version.name.charAt(0)}
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        className="z-[999999] bg-gray-800 border-gray-700 text-white min-w-lg fixed max-h-[400px] overflow-y-auto"
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
          </div>

          <div className="text-xs">
            <span className="text-gray-400">Models:</span>
            <span className="text-white ml-1">{version.data.models.join(", ") || "無"}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
