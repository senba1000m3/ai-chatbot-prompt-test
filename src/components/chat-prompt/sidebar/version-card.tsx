"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight, Copy, Download, Trash2, Play, GitFork, Eye } from "lucide-react"
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
import { AnimatePresence } from "framer-motion"
import { usePromptStore, availableModels, type SavedVersion, type ModelAccuracy } from "@/lib/store/prompt"

interface VersionCardProps {
  version: SavedVersion
  onDownloadVersion: (version: SavedVersion) => void
  filteredModelAccuracy?: ModelAccuracy[]
	setIsReadOnly: (value: boolean) => void
}

const availableTools = [
  { id: "sticker", name: "Sticker" },
  { id: "plot", name: "Plot" },
]

export function VersionCard({version, onDownloadVersion, filteredModelAccuracy, setIsReadOnly}: VersionCardProps) {
  const { loadVersion, copyVersion, deleteVersion, toggleVersionExpanded, setEditingVersionID } = usePromptStore()
  const [isDeleting, setIsDeleting] = useState(false)

  // 使用篩選後的準確率，如果沒有則使用原始準確率
  const displayModelAccuracy = filteredModelAccuracy || version.modelAccuracy || []

  // 獲取準確率顏色
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return "text-green-400"
    if (accuracy >= 80) return "text-yellow-400"
    if (accuracy >= 70) return "text-orange-400"
    return "text-red-400"
  }

  // 獲取準確率背景顏色
  const getAccuracyBgColor = (accuracy: number) => {
    if (accuracy >= 90) return "bg-green-500/20 border-green-500/30"
    if (accuracy >= 80) return "bg-yellow-500/20 border-yellow-500/30"
    if (accuracy >= 70) return "bg-orange-500/20 border-orange-500/30"
    return "bg-red-500/20 border-red-500/30"
  }

  // 獲取模型名稱
  const getModelName = (modelId: string) => {
    const model = availableModels.find((m) => m.id === modelId)
    return model?.name || modelId
  }

  // 獲取工具名稱
  const getToolName = (toolId: string) => {
    const tool = availableTools.find((t) => t.id === toolId)
    return tool?.name || toolId
  }

  // 獲取系統提示項目的顯示值 - 添加安全檢查
  const getSystemPromptDisplay = (value: string | undefined, label: string) => {
    if (!value || value.trim() === "") {
      return `${label}: 未設定`
    }
    return `${label}: ${value.length > 20 ? value.substring(0, 20) + "..." : value}`
  }

  const safeVersionData = {
    systemPrompt: {
      characterSettings: version.data?.systemPrompt?.characterSettings || "",
      selfAwareness: version.data?.systemPrompt?.selfAwareness || "",
      workflow: version.data?.systemPrompt?.workflow || "",
      formatLimits: version.data?.systemPrompt?.formatLimits || "",
      usedTools: version.data?.systemPrompt?.usedTools || "",
      repliesLimits: version.data?.systemPrompt?.repliesLimits || "",
      preventLeaks: version.data?.systemPrompt?.preventLeaks || "",
    },
    hintMessage: version.data?.hintMessage || [],
    parameters: {
      temperature: version.data?.parameters?.temperature || 0,
      batchSize: version.data?.parameters?.batchSize || "1",
      parameter2: version.data?.parameters?.parameter2 || "option1",
      parameter3: version.data?.parameters?.parameter3 || "option1",
    },
    models: version.data?.models || [],
    tools: version.data?.tools || [],
  }

  // 系統提示的所有項目
  const systemPromptItems = [
    { key: "characterSettings", label: "角色設定", value: safeVersionData.systemPrompt.characterSettings },
    { key: "selfAwareness", label: "自我認知", value: safeVersionData.systemPrompt.selfAwareness },
    { key: "workflow", label: "任務流程", value: safeVersionData.systemPrompt.workflow },
    { key: "formatLimits", label: "格式限制", value: safeVersionData.systemPrompt.formatLimits },
    { key: "usedTools", label: "工具使用", value: safeVersionData.systemPrompt.usedTools },
    { key: "repliesLimits", label: "回覆限制", value: safeVersionData.systemPrompt.repliesLimits },
    { key: "preventLeaks", label: "防洩漏", value: safeVersionData.systemPrompt.preventLeaks },
  ]

  // 參數項目
  const parameterItems = [
    { key: "temperature", label: "Temperature", value: safeVersionData.parameters.temperature.toString() },
  ]

  const handleDelete = () => {
    setIsDeleting(true)
    deleteVersion(version.id)
    // After deletion, the component will unmount, so no need to setIsDeleting(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
    >
      {/* 版本標題和操作按鈕 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleVersionExpanded(version.id)}
            className="p-1 h-6 w-6 hover:bg-gray-800"
          >
            <motion.div
              animate={{ rotate: version.expanded ? 90 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.div>
          </Button>
          <h3 className="font-medium text-white truncate flex-1">{version.name}</h3>
        </div>

        <div className="flex items-center space-x-1">
          {/* 複製按鈕 */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1 h-8 w-8 hover:bg-gray-800">
                <GitFork className="h-4 w-4 text-blue-400" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>複製版本</AlertDialogTitle>
                <AlertDialogDescription>確定要複製版本「{version.name}」的設定到當前工作區嗎？</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={() => copyVersion(version)}>複製</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* 下載按鈕 */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1 h-8 w-8 hover:bg-gray-800">
                <Download className="h-4 w-4 text-yellow-400" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>下載版本</AlertDialogTitle>
                <AlertDialogDescription>確定要下載版本「{version.name}」為 JSON 檔案嗎？</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDownloadVersion(version)}>下載</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

			{/* 查看按鈕 */}
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button variant="ghost" size="sm" className="p-1 h-8 w-8 hover:bg-gray-800">
						<Eye className="h-4 w-4 text-green-400" />
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>查看版本</AlertDialogTitle>
						<AlertDialogDescription>
							確定要查看版本 「{version.name}」 嗎？這將會覆蓋當前的設定。
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>取消</AlertDialogCancel>
						<AlertDialogAction onClick={() => {
							loadVersion(version);
							setEditingVersionID(version.id);
							setIsReadOnly(true);
						}}>查看</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

          {/* 刪除按鈕 */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1 h-8 w-8 hover:bg-gray-800" disabled={isDeleting}>
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>刪除版本</AlertDialogTitle>
                <AlertDialogDescription>確定要刪除版本「{version.name}」嗎？此操作無法復原。</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  刪除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* 模型準確率顯示 */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-2">
          {displayModelAccuracy.length > 0 ? (
            displayModelAccuracy.map((acc) => (
              <Badge
                key={acc.model}
                variant="outline"
                className={`text-xs ${getAccuracyColor(acc.accuracy)} border ${getAccuracyBgColor(acc.accuracy)}`}
              >
                {getModelName(acc.model)}: {acc.accuracy}%
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
              無準確率數據
            </Badge>
          )}
        </div>
      </div>

      {/* 基本信息 */}
      <div className="text-xs text-gray-400 mb-3">
        <div>儲存時間: {version.savedAt.toLocaleString()}</div>
      </div>

      {/* 展開的詳細信息 */}
      <AnimatePresence>
        {version.expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-4 pt-3 border-t border-gray-700 overflow-hidden"
          >
            {/* System Prompt 詳情 */}
            <div>
              <h4 className="text-sm font-medium text-white mb-2">System Prompt</h4>
              <div className="space-y-1">
                {systemPromptItems.map((item) => (
                  <div key={item.key} className="text-xs text-gray-300">
                    {getSystemPromptDisplay(item.value, item.label)}
                  </div>
                ))}
              </div>
            </div>

            {/* Default Hint Message 詳情 */}
            <div>
              <h4 className="text-sm font-medium text-white mb-2">
                Default Hint Message ({safeVersionData.hintMessage.length})
              </h4>
              <div className="space-y-1">
                {safeVersionData.hintMessage.slice(0, 3).map((prompt, index) => (
                  <div key={prompt.id || index} className="text-xs text-gray-300 truncate">
                    {index + 1}. {prompt.content || "無內容"}
                  </div>
                ))}
                {safeVersionData.hintMessage.length > 3 && (
                  <div className="text-xs text-gray-400">... 還有 {safeVersionData.hintMessage.length - 3} 個</div>
                )}
              </div>
            </div>

            {/* Parameters 詳情 */}
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Parameters</h4>
              <div className="space-y-1">
                {parameterItems.map((item) => (
                  <div key={item.key} className="text-xs text-gray-300">
                    {item.label}: {item.value}
                  </div>
                ))}
              </div>
            </div>

            {/* Models 詳情 */}
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Models ({safeVersionData.models.length})</h4>
              <div className="flex flex-wrap gap-1">
                {safeVersionData.models.length > 0 ? (
                  safeVersionData.models.map((modelId) => (
                    <Badge
                      key={modelId}
                      variant="secondary"
                      className="text-xs bg-blue-500/20 border-blue-500/30 text-blue-400"
                    >
                      {getModelName(modelId)}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                    無模型
                  </Badge>
                )}
              </div>
            </div>

            {/* Tools 詳情 */}
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Tools ({safeVersionData.tools.length})</h4>
              <div className="flex flex-wrap gap-1">
                {safeVersionData.tools.length > 0 ? (
                  safeVersionData.tools.map((toolId) => (
                    <Badge
                      key={toolId}
                      variant="secondary"
                      className="text-xs bg-green-500/20 border-green-500/30 text-green-400"
                    >
                      {getToolName(toolId)}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                    無工具
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
