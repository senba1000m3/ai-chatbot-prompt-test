"use client"

import { motion, AnimatePresence } from "framer-motion"
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
import { Edit, X, Save } from "lucide-react"
import { usePromptStore } from "@/lib/store/prompt"

interface ReadOnlyIndicatorProps {
    isReadOnly: boolean
	setIsReadOnly: (value: boolean) => void
    isEditing: boolean
	setIsEditing: (value: boolean) => void
}

export function ReadOnlyIndicator({
    isReadOnly,
	setIsReadOnly,
    isEditing,
	setIsEditing,
}: ReadOnlyIndicatorProps) {

	const { hintMessage, setHintMessage, setShowVersionHistory, resetVersion, editVersion, editingVersionID } = usePromptStore();

	const exitVersionMode = () => {
		setIsReadOnly(false);
		setIsEditing(false);
		setShowVersionHistory(false);
		resetVersion();
	}

	const saveVersionEdit = () => {
		setIsReadOnly(false);
		setIsEditing(false);
		setShowVersionHistory(false);
		editVersion(editingVersionID);
		resetVersion();
	}

	const currentVersionName = "123";
  return (
    <AnimatePresence>
      {isReadOnly && (
        <motion.div
          initial={{ y: -20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between p-3 bg-blue-900/30 border border-blue-700 rounded-lg"
        >
          <div>
            <span className="text-sm text-blue-300">{isEditing ? "編輯模式" : "版本檢視模式"}</span>
            <p className="text-xs text-blue-200 mt-1">當前版本: {currentVersionName}</p>
          </div>
          <div className="flex space-x-2">
            {!isEditing ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {setIsEditing(true)}}
                  className="h-7 border-blue-600 text-blue-300 hover:bg-blue-800 bg-transparent"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </motion.div>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 border-green-600 text-green-300 hover:bg-green-800 bg-transparent"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                  </motion.div>
                </AlertDialogTrigger>
                <AlertDialogContent
                  className="bg-black border-gray-800"
                  onEscapeKeyDown={(event) => {
                    event.preventDefault()
                    // AlertDialog 會自動處理 ESC 鍵
                  }}
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">儲存編輯</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                      確定要儲存對版本 &quot;{currentVersionName}&quot; 的編輯嗎？
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex justify-center space-x-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <AlertDialogAction onClick={saveVersionEdit} className="bg-green-600 hover:bg-green-700">
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
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="sm" variant="ghost" className="h-7 text-blue-300 hover:bg-blue-800">
                    <X className="w-3 h-3" />
                  </Button>
                </motion.div>
              </AlertDialogTrigger>
              <AlertDialogContent
                className="bg-black border-gray-800"
                onEscapeKeyDown={(event) => {
                  event.preventDefault()
                  // AlertDialog 會自動處理 ESC 鍵
                }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">退出版本檢視</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-300">
                    {isEditing ? "確定要退出編輯模式嗎？未儲存的變更將會遺失。" : "確定要退出版本檢視模式嗎？"}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex justify-center space-x-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <AlertDialogAction onClick={exitVersionMode} className="bg-blue-600 hover:bg-blue-700">
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
        </motion.div>
      )}
    </AnimatePresence>
  )
}
