"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Edit } from "lucide-react"
import { useState } from "react"

interface AdditionalSystemPromptProps {
  title: string
  value: string
  onChange: (value: string) => void
  isReadOnly: boolean
}

export function AdditionalSystemPrompt({ title, value, onChange, isReadOnly }: AdditionalSystemPromptProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [hasChanges, setHasChanges] = useState(false)
  const [closeWarningOpen, setCloseWarningOpen] = useState(false)

  const handleDialogOpen = () => {
    setEditValue(value)
    setHasChanges(false)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    if (hasChanges) {
      setCloseWarningOpen(true)
    } else {
      setDialogOpen(false)
    }
  }

  const handleSave = () => {
    onChange(editValue)
    setHasChanges(false)
    setDialogOpen(false)
  }

  const handleEditChange = (newValue: string) => {
    setEditValue(newValue)
    setHasChanges(newValue !== value)
  }

  const handleForceClose = () => {
    setCloseWarningOpen(false)
    setDialogOpen(false)
    setHasChanges(false)
  }

  const displayText = value || `請設定${title}內容...`
  const truncatedText = displayText.length > 50 ? `${displayText.substring(0, 50)}...` : displayText

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex-1 text-sm text-gray-300 cursor-help truncate pr-2 max-w-[calc(100%-2rem)]">
              {truncatedText}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-md bg-gray-800 border-gray-700 text-white p-3">
            <div className="whitespace-pre-wrap text-sm">{displayText}</div>
          </TooltipContent>
        </Tooltip>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDialogOpen}
                disabled={isReadOnly}
                className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-800 flex-shrink-0"
              >
                <Edit className="w-3 h-3" />
              </Button>
            </motion.div>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-black border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">編輯{title}</DialogTitle>
              <DialogDescription className="text-gray-300">修改{title}的詳細內容</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                value={editValue}
                onChange={(e) => handleEditChange(e.target.value)}
                placeholder={`輸入${title}內容...`}
                className="min-h-32 bg-gray-900 border-gray-800 text-white resize-y focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <DialogFooter className="flex justify-center space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  儲存
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={handleDialogClose}
                  className="text-gray-300 border-gray-800 hover:bg-gray-900 bg-transparent"
                >
                  關閉
                </Button>
              </motion.div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 關閉警告對話框 */}
      <AlertDialog open={closeWarningOpen} onOpenChange={setCloseWarningOpen}>
        <AlertDialogContent className="bg-black border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">未儲存的變更</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              您有未儲存的變更，確定要關閉編輯視窗嗎？變更將會遺失。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setCloseWarningOpen(false)}
              className="text-gray-300 border-gray-800 hover:bg-gray-900"
            >
              繼續編輯
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleForceClose} className="bg-red-600 hover:bg-red-700">
              放棄變更
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  )
}
