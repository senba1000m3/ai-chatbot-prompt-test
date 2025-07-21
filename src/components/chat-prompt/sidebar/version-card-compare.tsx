"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge" // 新增 Badge 導入
import { usePromptStore, type SavedVersion } from "@/lib/store/prompt" // 導入共享的類型

// 定義可用的模型和工具 (與 version-card.tsx 相同)
const availableModels = [
  { id: "o4-mini", name: "o4-mini" },
  { id: "o3-mini", name: "o3-mini" },
  { id: "gpt-4.1", name: "GPT-4.1" },
  { id: "gpt-4.1-mini", name: "GPT-4.1 mini" },
  { id: "gpt-4.1-nano", name: "GPT-4.1 nano" },
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "gpt-4o-mini", name: "GPT-4o mini" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
  { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
  { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite" },
]

const availableTools = [
  { id: "sticker", name: "Sticker" },
  { id: "plot", name: "Plot" },
]

interface VersionCardCompareProps {
  version: SavedVersion
  onToggleExpanded: (versionId: string) => void
}

export function VersionCardCompare({ version, onToggleExpanded }: VersionCardCompareProps) {
  const { savedVersions, compareSelectedVersions, setCompareSelectedVersions } = usePromptStore()

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
    { key: "batchSize", label: "Batch Size", value: safeVersionData.parameters.batchSize },
    { key: "parameter2", label: "Parameter 2", value: safeVersionData.parameters.parameter2 },
    { key: "parameter3", label: "Parameter 3", value: safeVersionData.parameters.parameter3 },
  ]

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={`bg-gray-900 border-gray-800 ${compareSelectedVersions.includes(version.id) ? "ring-2 ring-blue-500" : ""}`}>
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={compareSelectedVersions.includes(version.id)}
                onCheckedChange={() => setCompareSelectedVersions(version.id)}
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
              className="text-xs text-gray-300 space-y-4 pt-3 border-t border-gray-800 overflow-hidden"
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
        </div>
      </Card>
    </motion.div>
  )
}
