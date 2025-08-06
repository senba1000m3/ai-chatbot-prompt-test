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
import { useAdvancedStore } from "@/lib/store/advanced";
import { mergeTestResults } from "@/components/chat-prompt/advanced/analytics/merge-test-results";

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
  const [showModelScore, setShowModelScore] = useState(false)

  const getModelName = (modelId: string) => {
    const model = availableModels.find((m) => m.id === modelId)
    return model?.name || modelId
  }

  const getToolName = (toolId: string) => {
    const tool = availableTools.find((t) => t.id === toolId)
    return tool?.name || toolId
  }

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

  const systemPromptItems = [
    { key: "characterSettings", label: "角色設定", value: safeVersionData.systemPrompt.characterSettings },
    { key: "selfAwareness", label: "自我認知", value: safeVersionData.systemPrompt.selfAwareness },
    { key: "workflow", label: "任務流程", value: safeVersionData.systemPrompt.workflow },
    { key: "formatLimits", label: "格式限制", value: safeVersionData.systemPrompt.formatLimits },
    { key: "usedTools", label: "工具使用", value: safeVersionData.systemPrompt.usedTools },
    { key: "repliesLimits", label: "回覆限制", value: safeVersionData.systemPrompt.repliesLimits },
    { key: "preventLeaks", label: "防洩漏", value: safeVersionData.systemPrompt.preventLeaks },
  ]

  const parameterItems = [
    { key: "temperature", label: "Temperature", value: safeVersionData.parameters.temperature.toString() },
  ]

  const handleDelete = () => {
    setIsDeleting(true)
    deleteVersion(version.id)
    // After deletion, the component will unmount, so no need to setIsDeleting(false)
  }

  const ratingCategories = useAdvancedStore(state => state.ratingCategories)
  const rubrics = useAdvancedStore(state => state.rubrics)
  const testResults = useAdvancedStore(state => state.testResults)

  const { mergedResults, countMap } = mergeTestResults(testResults)

  function getCategoryAveragesForVersion(versionId: string) {
    const categoryRubricMap: Record<string, string[]> = {}
    for (const rubric of rubrics) {
      if (!categoryRubricMap[rubric.category_id]) categoryRubricMap[rubric.category_id] = []
      categoryRubricMap[rubric.category_id].push(rubric.rubric_id)
    }
    return ratingCategories.map(category => {
      const rubricIds = categoryRubricMap[category.category_id] || []
      const scores: number[] = []
      for (const result of mergedResults) {
        if (result.versionId !== versionId) continue
        for (const modelId in result.ratings[versionId] || {}) {
          for (const rubricId of rubricIds) {
            const score = result.ratings[versionId][modelId][rubricId]
            if (typeof score === 'number') scores.push(score)
          }
        }
      }
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null
      return { category, avg }
    })
  }

  function getOverallAverage(versionId: string) {
    const scores: number[] = []
    for (const result of mergedResults) {
      if (result.versionId !== versionId) continue
      for (const modelId in result.ratings[versionId] || {}) {
        for (const rubricId in result.ratings[versionId][modelId]) {
          const score = result.ratings[versionId][modelId][rubricId]
          if (typeof score === 'number') {
            scores.push(score)
          }
        }
      }
    }
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null
  }
  const overallAvg = getOverallAverage(version.id)

  // 計算此版本的 countMap 次數總和
  const versionCount = Object.entries(countMap).reduce((acc, [key, val]) => {
    if (key.startsWith(version.id + '|||')) return acc + val
    return acc
  }, 0)

  const categoryAverages = getCategoryAveragesForVersion(version.id)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-gray-900 border border-gray-700 rounded-lg px-2 pt-3 pb-1 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
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
          <h3 className="font-medium text-base text-white truncate flex-1 -ml-1">{version.name}</h3>
        </div>

        <div className="flex items-center -space-x-[1px]">
          {/* 複製按鈕 */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1 h-7 w-7 hover:bg-gray-800">
                <GitFork className="h-4 w-4 text-blue-400" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>複製版本</AlertDialogTitle>
                <AlertDialogDescription>確定要複製版本 「{version.name}」 的設定到當前工作區嗎？</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => copyVersion(version)}>複製</AlertDialogAction>
                <AlertDialogCancel>取消</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* 下載按鈕 */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1 h-7 w-7 hover:bg-gray-800">
                <Download className="h-4 w-4 text-yellow-400" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>下載版本</AlertDialogTitle>
                <AlertDialogDescription>確定要下載版本 「{version.name}」 為 JSON 檔案嗎？</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => onDownloadVersion(version)}>下載</AlertDialogAction>
                <AlertDialogCancel>取消</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

			{/* 查看按鈕 */}
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button variant="ghost" size="sm" className="p-1 h-7 w-7 hover:bg-gray-800">
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
						<AlertDialogAction onClick={() => {
							loadVersion(version);
							setEditingVersionID(version.id);
							setIsReadOnly(true);
						}}>查看</AlertDialogAction>
						<AlertDialogCancel>取消</AlertDialogCancel>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

          {/* 刪除按鈕 */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1 h-7 w-7 hover:bg-gray-800" disabled={isDeleting}>
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>刪除版本</AlertDialogTitle>
                <AlertDialogDescription>確定要刪除版本「{version.name}」嗎？此操作無法復原。</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  刪除
                </AlertDialogAction>
                <AlertDialogCancel>取消</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="ml-2 mb-3 flex items-center">
        {overallAvg !== null ? (
          <>
            <span className="text-sm font-bold mr-4">
              總平均：<span
                style={{ color: overallAvg === 5 ? '#65dbff' : overallAvg >= 4 ? '#22c55e' : overallAvg >= 3 ? '#eab308' : '#ef4444' }}
              >
                {overallAvg.toFixed(2)}
              </span>
            </span>
            <span className="text-sm font-bold">次數：<span className="text-blue-400">{versionCount}</span></span>
          </>
        ) : (
          <span className="text-red-400 text-sm font-bold">未測試版本</span>
        )}
      </div>

      <div className="ml-1 mb-4">
        <div className="flex flex-wrap gap-2">
          {categoryAverages.length > 0 && categoryAverages.some(c => c.avg !== null) ? (
            categoryAverages.map(({ category, avg }) => (
              <Badge
                key={category.category_id}
                variant="outline"
                className={`text-xs border ${avg === null ? 'text-gray-400 border-gray-600' : avg == 5 ? 'text-blue-400 bg-blue-500/20 border-blue-500/30' : avg >= 4 ? 'text-green-400 bg-green-500/20 border-green-500/30' : avg >= 3 ? 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' : 'text-red-400 bg-red-500/20 border-red-500/30'}`}
              >
                {category.name}：{avg !== null ? avg.toFixed(2) : '無'}
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
              無評分數據
            </Badge>
          )}
        </div>
      </div>

      {/* 基本信息 */}
      <div className="text-xs text-gray-400 ml-2 mb-3">
        <div style={{whiteSpace: "pre"}}>儲存時間: {version.savedAt.toLocaleString().split(".")[0].replace("T", "  ")}</div>
      </div>

      {/* 展開的詳細信息 */}
      <AnimatePresence>
        {version.expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-4 pt-3 border-t border-gray-700 overflow-hidden ml-2"
          >
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

            {/* Test Models */}
            <div>
              <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                Test Models {filteredModelAccuracy && filteredModelAccuracy.length > 0 ? `(${filteredModelAccuracy.length})` : ''}
                {/* 分數顯示開關按鈕 */}
                {filteredModelAccuracy && filteredModelAccuracy.length > 0 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-16 p-0 text-xs border border-gray-500/30 text-gray-400 hover:bg-purple-500/10"
                    onClick={() => setShowModelScore((v) => !v)}
                    tabIndex={0}
                    aria-label="顯示/隱藏模型分數"
                  >
                    {showModelScore ? '隱藏分數' : '顯示分數'}
                  </Button>
                )}
              </h4>
              <div className="flex flex-wrap gap-1">
                {filteredModelAccuracy && filteredModelAccuracy.length > 0 ? (
                  filteredModelAccuracy.map((item) => {
                    const scores: number[] = [];
                    for (const result of mergedResults) {
                      if (result.versionId !== version.id) continue;
                      if (result.ratings[version.id] && result.ratings[version.id][item.model]) {
                        for (const rubricId in result.ratings[version.id][item.model]) {
                          const score = result.ratings[version.id][item.model][rubricId];
                          if (typeof score === 'number') scores.push(score);
                        }
                      }
                    }
                    const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : null;
                    return (
                      <Badge
                        key={item.model}
                        variant="secondary"
                        className="text-xs bg-purple-500/20 border-purple-500/30 text-purple-400"
                      >
                        {item.model}{showModelScore && (avg !== null ? ` | ${avg}` : ' | NaN')}
                      </Badge>
                    );
                  })
                ) : (
                  <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                    無測試模型
                  </Badge>
                )}
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
			<div className="mb-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
