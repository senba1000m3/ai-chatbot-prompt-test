"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"

interface Model {
  id: string
  name: string
  category: string
}

interface Tool {
  id: string
  name: string
}

interface SelectedItemsDisplayProps {
  isReadOnly: boolean
  selectedModels: string[]
  selectedTools: string[]
  availableModels: Model[]
  availableTools: Tool[]
}

export function SelectedItemsDisplay({
  isReadOnly,
  selectedModels,
  selectedTools,
  availableModels,
  availableTools,
}: SelectedItemsDisplayProps) {
  return (
    <AnimatePresence>
      {isReadOnly && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div>
            <h4 className="text-sm font-medium mb-2 text-white">Selected Model</h4>
            <div className="flex flex-wrap gap-2">
              {selectedModels.map((modelId, index) => {
                const model = availableModels.find((m) => m.id === modelId)
                return (
                  <motion.div
                    key={modelId}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Badge variant="secondary" className="bg-blue-900/50 text-blue-200 border-blue-700">
                      {model?.name || modelId}
                    </Badge>
                  </motion.div>
                )
              })}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2 text-white">Activated Tools</h4>
            <div className="flex flex-wrap gap-2">
              {selectedTools.map((toolId, index) => {
                const tool = availableTools.find((t) => t.id === toolId)
                return (
                  <motion.div
                    key={toolId}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Badge variant="secondary" className="bg-green-900/50 text-green-200 border-green-700">
                      {tool?.name || toolId}
                    </Badge>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
