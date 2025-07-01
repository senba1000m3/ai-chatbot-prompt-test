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
import { Checkbox } from "@/components/ui/checkbox"
import { Wrench } from "lucide-react"

interface Tool {
  id: string
  name: string
}

interface ToolSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTools: string[]
  onToggleTool: (toolId: string) => void
  onSave: () => void
  availableTools: Tool[]
  onClick?: () => void
}

export function ToolSelectionDialog({
  open,
  onOpenChange,
  selectedTools,
  onToggleTool,
  onSave,
  availableTools,
  onClick,
}: ToolSelectionDialogProps) {
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
    // 如果對話框被關閉且不是通過保存，重置臨時選擇
    if (!newOpen) {
      // 這裡需要父組件處理重置邏輯
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="secondary"
            className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white"
            onClick={onClick}
          >
            <Wrench className="w-4 h-4" />
            <span>Tools ({selectedTools.length})</span>
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-black border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Select Tools</DialogTitle>
          <DialogDescription className="text-gray-300">Choose which tools to use for testing.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          {availableTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="flex items-center space-x-2"
            >
              <Checkbox
                id={tool.id}
                checked={selectedTools.includes(tool.id)}
                onCheckedChange={() => onToggleTool(tool.id)}
              />
              <label htmlFor={tool.id} className="text-sm text-white">
                {tool.name}
              </label>
            </motion.div>
          ))}
        </div>
        <DialogFooter className="flex justify-center space-x-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-gray-300 border-gray-800 hover:bg-gray-900"
            >
              Cancel
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
