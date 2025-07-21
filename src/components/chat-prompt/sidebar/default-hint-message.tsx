"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Trash2, Plus } from "lucide-react"
import { usePromptStore, type HintMessage } from "@/lib/store/prompt"
import { useState } from "react"

export function DefaultHintMessage({ isReadOnly }: { isReadOnly: boolean }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
	const { setHintMessage, hintMessage } = usePromptStore();

  const handleDoubleClick = (message: HintMessage) => {
    if (isReadOnly) return
    setEditingId(message.id)
    setEditValue(message.content)
  }

  const handleEditSave = (id: string) => {
    if (!editValue.trim()) return

    const updatedMessages = hintMessage.map((msg) => (msg.id === id ? { ...msg, content: editValue.trim() } : msg))
	setHintMessage(updatedMessages)
    setEditingId(null)
    setEditValue("")
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditValue("")
  }

  const handleDelete = (id: string) => {
    const updatedMessages = hintMessage.filter((msg) => msg.id !== id)
	setHintMessage(updatedMessages)
  }

  const handleAddNew = () => {
    const newHintMessage: HintMessage = {
      id: Date.now().toString(),
      content: "",
    }
	setHintMessage([...hintMessage, newHintMessage])
    setEditingId(newHintMessage.id)
    setEditValue("")
  }

  const handleKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      handleEditSave(id)
    } else if (e.key === "Escape") {
      handleEditCancel()
    }
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {hintMessage.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <Card className="bg-gray-900 border-gray-800 p-3">
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  {editingId === message.id ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleEditSave(message.id)}
                      onKeyDown={(e) => handleKeyPress(e, message.id)}
                      className="bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500"
                      placeholder="輸入提示訊息..."
                      autoFocus
                    />
                  ) : (
                    <div
                      className="text-sm text-white cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors"
                      onDoubleClick={() => handleDoubleClick(message)}
                    >
                      {message.content || "點擊兩下編輯..."}
                    </div>
                  )}
                </div>
                {!isReadOnly && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(message.id)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {!isReadOnly && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: hintMessage.length * 0.05, duration: 0.3 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleAddNew}
              variant="outline"
              className="w-full bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" />
              新增初始化訊息
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
