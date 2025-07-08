"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { useState } from "react"

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
  modelResponses?: ModelResponse[]
  expanded?: boolean
}

interface VersionCardProps {
  version: SavedVersion
  onLoadVersion: (version: SavedVersion) => void
  onCopyVersion: (version: SavedVersion) => void
  onDeleteVersion: (version: SavedVersion) => void
  onToggleExpanded: (versionId: string) => void
}

// 計算模型準確率
const calculateModelAccuracy = (modelResponse: ModelResponse): number => {
  const assistantMessages = modelResponse.messages.filter((msg) => msg.role === "assistant" && msg.rating)
  if (assistantMessages.length === 0) return 0

  const goodRatings = assistantMessages.filter((msg) => msg.rating === "good").length
  return (goodRatings / assistantMessages.length) * 100
}

// 獲取準確率顏色
const getAccuracyColor = (accuracy: number): string => {
  if (accuracy >= 80) return "text-green-400"
  if (accuracy >= 60) return "text-yellow-400"
  if (accuracy >= 40) return "text-orange-400"
  return "text-red-400"
}

export function VersionCard({
  version,
  onLoadVersion,
  onCopyVersion,
  onDeleteVersion,
  onToggleExpanded,
}: VersionCardProps) {
  // 添加本地狀態來控制對話框
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [copyDialogOpen, setCopyDialogOpen] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)

  // 計算所有模型的準確率
  const modelAccuracies =
    version.modelResponses?.map((modelResponse) => ({
      modelId: modelResponse.id,
      modelName: modelResponse.name,
      accuracy: calculateModelAccuracy(modelResponse),
    })) || []

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Delete button clicked for version:", version.name)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    console.log("Confirming delete for version:", version.name)
    onDeleteVersion(version)
    setDeleteDialogOpen(false)
  }

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCopyDialogOpen(true)
  }

  const handleCopyConfirm = () => {
    onCopyVersion(version)
    setCopyDialogOpen(false)
  }

  const handleLoadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLoadDialogOpen(true)
  }

  const handleLoadConfirm = () => {
    onLoadVersion(version)
    setLoadDialogOpen(false)
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="bg-gray-900 border-gray-800">
        <div
          className="p-3 cursor-pointer hover:bg-gray-800 transition-colors"
          onClick={() => onToggleExpanded(version.id)}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-medium text-white">{version.name}</h3>
              <p className="text-xs text-gray-400">{version.savedAt.toLocaleString()}</p>
            </div>
            <div className="flex space-x-2">
              {/* 複製按鈕 */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white border-0"
                  onClick={handleCopyClick}
                >
                  複製
                </Button>
              </motion.div>

              {/* 載入按鈕 */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white border-0"
                  onClick={handleLoadClick}
                >
                  載入
                </Button>
              </motion.div>

              {/* 展開/收起按鈕 */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleExpanded(version.id)
                  }}
                >
                  <motion.div animate={{ rotate: version.expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </Button>
              </motion.div>
            </div>
          </div>

          <AnimatePresence>
            {version.expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-xs text-gray-300 space-y-2 border-t border-gray-800 pt-2 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {modelAccuracies.length > 0 && (
                  <div className="mb-3">
                    <p className="text-gray-400 mb-2 font-medium">模型準確率:</p>
                    <div className="space-y-1">
                      {modelAccuracies.map(({ modelId, modelName, accuracy }) => (
                        <div key={modelId} className="flex items-center justify-between">
                          <span className="text-gray-300">{modelName}:</span>
                          <span className={`font-mono ${getAccuracyColor(accuracy)}`}>{accuracy.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 mb-1">System Prompt:</p>
                  <p className="text-gray-300 bg-gray-900 p-2 rounded text-xs max-h-20 overflow-y-auto border border-gray-800">
                    {version.systemPrompt || "無"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">User Prompt:</p>
                  <p className="text-gray-300 bg-gray-900 p-2 rounded text-xs max-h-20 overflow-y-auto border border-gray-800">
                    {version.userPrompt || "無"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <p>
                    <span className="text-gray-400">Temperature:</span> {version.temperature}
                  </p>
                  <p>
                    <span className="text-gray-400">Batch Size:</span> {version.batchSize}
                  </p>
                  <p>
                    <span className="text-gray-400">Parameter 2:</span> {version.parameter2}
                  </p>
                  <p>
                    <span className="text-gray-400">Parameter 3:</span> {version.parameter3}
                  </p>
                </div>
                <p>
                  <span className="text-gray-400">Models:</span> {version.selectedModels.join(", ")}
                </p>
                <p>
                  <span className="text-gray-400">Tools:</span> {version.selectedTools.join(", ")}
                </p>

                {/* 刪除按鈕 */}
                <div className="pt-2 border-t border-gray-800">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full h-8 text-xs bg-red-600 hover:bg-red-700 text-white border-0"
                      onClick={handleDeleteClick}
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      刪除版本
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* 複製確認對話框 */}
      <AlertDialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <AlertDialogContent className="bg-black border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">複製版本</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              確定要複製版本 "{version.name}" 的設定嗎？這將會覆蓋目前的設定並退出版本檢視模式。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center space-x-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <AlertDialogAction onClick={handleCopyConfirm} className="bg-blue-600 hover:bg-blue-700">
                確認
              </AlertDialogAction>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <AlertDialogCancel className="text-gray-300 border-gray-800 hover:bg-gray-900">取消</AlertDialogCancel>
            </motion.div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 載入確認對話框 */}
      <AlertDialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <AlertDialogContent className="bg-black border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">載入版本</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              確定要載入版本 "{version.name}" 嗎？這將會覆蓋目前的設定並進入版本檢視模式。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center space-x-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <AlertDialogAction onClick={handleLoadConfirm} className="bg-green-600 hover:bg-green-700">
                確認
              </AlertDialogAction>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <AlertDialogCancel className="text-gray-300 border-gray-800 hover:bg-gray-900">取消</AlertDialogCancel>
            </motion.div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 刪除確認對話框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-black border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">刪除版本</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              確定要刪除版本 "{version.name}" 嗎？此操作無法復原，所有相關的設定和對話記錄都將被永久刪除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center space-x-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                確認刪除
              </AlertDialogAction>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <AlertDialogCancel className="text-gray-300 border-gray-800 hover:bg-gray-900">取消</AlertDialogCancel>
            </motion.div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
