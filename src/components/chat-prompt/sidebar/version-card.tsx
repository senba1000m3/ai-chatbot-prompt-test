"use client"

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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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

interface VersionCardProps {
  version: SavedVersion
  onLoadVersion: (version: SavedVersion) => void
  onCopyVersion: (version: SavedVersion) => void
  onToggleExpanded: (versionId: string) => void
}

export function VersionCard({ version, onLoadVersion, onCopyVersion, onToggleExpanded }: VersionCardProps) {
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white border-0"
                    >
                      複製 <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </motion.div>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-black border-gray-800" onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">複製版本</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                      確定要複製版本 "{version.name}" 的設定嗎？這將會覆蓋目前的設定並退出版本檢視模式。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex justify-center space-x-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.stopPropagation()
                          onCopyVersion(version)
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        確認
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

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white border-0"
                    >
                      載入 <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </motion.div>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-black border-gray-800" onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">載入版本</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                      確定要載入版本 "{version.name}" 嗎？這將會覆蓋目前的設定並進入版本檢視模式。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex justify-center space-x-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.stopPropagation()
                          onLoadVersion(version)
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        確認
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
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  )
}
