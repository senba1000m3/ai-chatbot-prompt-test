"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronRight } from "lucide-react"

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
  expanded?: boolean
}

interface VersionCardCompareProps {
  version: SavedVersion
  isSelected: boolean
  onToggleSelect: (versionId: string) => void
  onToggleExpanded: (versionId: string) => void
}

export function VersionCardCompare({ version, isSelected, onToggleSelect, onToggleExpanded }: VersionCardCompareProps) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={`bg-gray-900 border-gray-800 ${isSelected ? "ring-2 ring-blue-500" : ""}`}>
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect(version.id)}
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
              className="text-xs text-gray-300 space-y-2 border-t border-gray-800 pt-2 overflow-hidden"
            >
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
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
