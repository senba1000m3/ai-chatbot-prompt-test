"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Send, ChevronUpIcon } from "lucide-react"

interface EnhancedMessageInputProps {
  inputMessage: string
  setInputMessage: (value: string) => void
  onSendMessage: (times?: number) => void
  disabled: boolean
  multiSendTimes: number
  setMultiSendTimes: (times: number) => void
}

export function EnhancedMessageInput({
  inputMessage,
  setInputMessage,
  onSendMessage,
  disabled,
  multiSendTimes,
  setMultiSendTimes,
}: EnhancedMessageInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault()
      onSendMessage(1)
    }
  }

  const placeholderText = disabled ? "請點擊清除並重新開始對話！" : "輸入訊息..."
  const cursorClass = disabled ? "cursor-not-allowed" : ""

  return (
    <div className="flex space-x-2">
      <Input
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        placeholder={placeholderText}
        className={`flex-1 bg-gray-900 border-gray-800 text-white h-10 focus:border-blue-500 focus:ring-blue-500 transition-colors ${cursorClass}`}
        disabled={disabled}
        onKeyPress={handleKeyPress}
      />

      {/* 單次發送按鈕 */}
      <motion.div whileHover={{ scale: disabled ? 1 : 1.05 }} whileTap={{ scale: disabled ? 1 : 0.95 }}>
        <Button
          onClick={() => onSendMessage(1)}
          size="sm"
          className="h-10 px-4 bg-blue-600 hover:bg-blue-700 transition-colors"
          disabled={disabled || !inputMessage.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* 多次發送按鈕 */}
      <div className="flex">
        <motion.div whileHover={{ scale: disabled ? 1 : 1.05 }} whileTap={{ scale: disabled ? 1 : 0.95 }}>
          <Button
            onClick={() => onSendMessage(multiSendTimes)}
            className="bg-green-600 hover:bg-green-700 rounded-r-none transition-colors h-10"
            disabled={disabled || !inputMessage.trim()}
          >
            <Send className="w-4 h-4 mr-2" />
            發送 {multiSendTimes} 次
          </Button>
        </motion.div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: disabled ? 1 : 1.05 }} whileTap={{ scale: disabled ? 1 : 0.95 }}>
              <Button
                className="bg-green-600 hover:bg-green-700 rounded-l-none border-l border-green-500 px-2 transition-colors h-10"
                disabled={disabled}
              >
                <ChevronUpIcon className="w-4 h-4" />
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-900 border-gray-800">
            {[1, 3, 5, 10, 20].map((num) => (
              <DropdownMenuItem
                key={num}
                onClick={() => setMultiSendTimes(num)}
                className="text-white hover:bg-gray-800 transition-colors"
              >
                {num} 次
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
