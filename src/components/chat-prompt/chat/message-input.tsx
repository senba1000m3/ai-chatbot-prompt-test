"use client"

import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface MessageInputProps {
  inputMessage: string
  setInputMessage: (value: string) => void
  onSendMessage: () => void
  isReadOnly: boolean
}

export function MessageInput({ inputMessage, setInputMessage, onSendMessage, isReadOnly }: MessageInputProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      className="p-4 border-t border-gray-800 flex-shrink-0"
    >
      <div className="flex space-x-2">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="輸入訊息..."
          className="flex-1 bg-gray-900 border-gray-800 text-white h-10 focus:border-blue-500 focus:ring-blue-500 transition-colors"
          disabled={false}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              onSendMessage()
            }
          }}
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onSendMessage}
            size="sm"
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 transition-colors"
            disabled={false}
          >
            <Send className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
