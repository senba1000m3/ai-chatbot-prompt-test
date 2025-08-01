"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ChevronRight, GripVertical } from "lucide-react"
import type { SavedVersion } from "@/lib/store/prompt"
import { useMemo } from "react"

interface CompareVersionCardProps {
  version: SavedVersion
  colorConfig: { border: string; bg: string; badge: string }
  isExpanded: boolean
  isDragOver: boolean
  isDragging: boolean
  onToggleExpand: (id: string) => void
  onDragStart: (e: any, version: SavedVersion) => void
  onDragOver: (e: any, index: number) => void
  onDragLeave: () => void
  onDrop: (e: any, index: number) => void
  onDragEnd: () => void
  index: number
}

export function CompareVersionCard({
  version,
  colorConfig,
  isExpanded,
  isDragOver,
  isDragging,
  onToggleExpand,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  index,
}: CompareVersionCardProps) {
  // 安全處理資料
  const safeVersionData = useMemo(() => ({
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
    },
    models: version.data?.models || [],
  }), [version])

  // 取得模型名稱
  const getModelName = (modelId: string) => {
    // 若有全域模型清單可引入，這裡可優化
    return modelId
  }
  // 取得工具名稱
  const getToolName = (toolId: string) => {
    return toolId
  }

  // 系統提示項目
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
    { key: "batchSize", label: "Batch Size", value: safeVersionData.parameters.batchSize },
  ]

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{
        x: 0,
        opacity: isDragging ? 0.5 : 1,
        scale: isDragOver ? 1.02 : 1,
      }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      draggable
      onDragStart={(e) => onDragStart(e, version)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
    >
      <Card
        className={`bg-gray-900 border border-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-200 ${colorConfig.border} ${isDragOver ? "ring-2 ring-blue-500" : ""}`}
        onClick={() => onToggleExpand(version.id)}
      >
        {/* 標題與時間 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <h3 className="font-medium text-white truncate flex-1">{version.name}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={`text-xs text-white border-gray-600 ${colorConfig.badge}`}>{version.name}</Badge>
            <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </motion.div>
          </div>
        </div>
        <div className="text-xs text-gray-400 mb-3">儲存時間: {version.savedAt.toLocaleString()}</div>
        <AnimatePresence>
          {isExpanded && (
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
                <div className="space-y-2">
                  {systemPromptItems.map((item) => (
                    <div key={item.key}>
                      <div className="text-xs font-semibold text-gray-400 mb-1">{item.label}</div>
                      <div className="text-xs text-gray-300 whitespace-pre-line break-words">{item.value ? item.value : "未設定"}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Default Hint Message 詳情 */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Default Hint Message ({safeVersionData.hintMessage.length})</h4>
                <div className="space-y-2">
                  {safeVersionData.hintMessage.map((prompt: any, index: number) => (
                    <div key={prompt.id ? String(prompt.id) : `hint-${index}`}>
                      <div className="text-xs font-semibold text-gray-400 mb-1">訊息 {index + 1}</div>
                      <div className="text-xs text-gray-300 whitespace-pre-line break-words">{prompt.content || "無內容"}</div>
                    </div>
                  ))}
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
                    safeVersionData.models.map((modelId: string) => (
                      <Badge key={modelId} variant="secondary" className="text-xs bg-blue-500/20 border-blue-500/30 text-blue-400">
                        {getModelName(modelId)}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">無模型</Badge>
                  )}
                </div>
              </div>
              {/* Tools 詳情 (如有) */}
              {Array.isArray(version.data?.tools) && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Tools ({version.data.tools.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {version.data.tools.length > 0 ? (
                      version.data.tools.map((toolId: string) => (
                        <Badge key={toolId} variant="secondary" className="text-xs bg-green-500/20 border-green-500/30 text-green-400">
                          {getToolName(toolId)}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">無工具</Badge>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

