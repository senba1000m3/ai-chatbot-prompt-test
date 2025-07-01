"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { GitCompare, X, CheckSquare } from "lucide-react"

interface VersionHistoryHeaderProps {
  isCompareMode: boolean
  selectedVersions: string[]
  onToggleCompareMode: () => void
  onConfirmCompare: () => void
  onCancelCompare: () => void
  onSelectAll: () => void
  totalVersions: number
}

export function VersionHistoryHeader({
  isCompareMode,
  selectedVersions,
  onToggleCompareMode,
  onConfirmCompare,
  onCancelCompare,
  onSelectAll,
  totalVersions,
}: VersionHistoryHeaderProps) {
  const isAllSelected = selectedVersions.length === totalVersions && totalVersions > 0

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      className="p-4 border-b border-gray-800 flex justify-between items-center"
    >
      <h2 className="text-lg font-semibold text-white">Version History</h2>
      <div className="flex items-center space-x-1">
        {!isCompareMode ? (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleCompareMode}
              className="text-blue-300 border-blue-600 hover:bg-blue-800 bg-transparent"
            >
              <GitCompare className="w-4 h-4 mr-1" />
              Prompt 比對
            </Button>
          </motion.div>
        ) : (
          <div className="flex items-center space-x-1">
            {totalVersions > 0 && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSelectAll}
                  className={`text-xs px-2 py-1 h-7 transition-colors ${
                    isAllSelected
                      ? "text-orange-300 border-orange-600 hover:bg-orange-800 bg-transparent"
                      : "text-purple-300 border-purple-600 hover:bg-purple-800 bg-transparent"
                  }`}
                >
                  <CheckSquare className="w-3 h-3 mr-1" />
                  {isAllSelected ? "取消全選" : "全選"}
                </Button>
              </motion.div>
            )}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={onConfirmCompare}
                disabled={selectedVersions.length < 2}
                className="text-green-300 border-green-600 hover:bg-green-800 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed text-xs px-2 py-1 h-7"
              >
                確定選取 ({selectedVersions.length})
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancelCompare}
                className="text-gray-400 hover:text-white hover:bg-gray-800 px-2 py-1 h-7"
              >
                <X className="w-3 h-3" />
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
