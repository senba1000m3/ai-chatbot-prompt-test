"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Smile, Frown } from "lucide-react"
import { useState } from "react"

interface Message {
  role: "user" | "assistant"
  content: string
  model?: string
  rating?: "good" | "bad" | null
  id?: string
}

interface MessageBubbleProps {
  message: Message
  index: number
  onRating?: (messageId: string, rating: "good" | "bad") => void
  showRating?: boolean
  responseTime?: number
}

export function MessageBubble({ message, index, onRating, showRating = false, responseTime }: MessageBubbleProps) {
  const [currentRating, setCurrentRating] = useState<"good" | "bad" | null>(message.rating || null)

  const handleRating = (rating: "good" | "bad") => {
    const newRating = currentRating === rating ? null : rating
    setCurrentRating(newRating)
    if (onRating && message.id) {
      onRating(message.id, newRating || rating)
    }
  }

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: message.role === "user" ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.05,
        duration: 0.3,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      className={`${message.role === "user" ? "ml-8" : "mr-8"}`}
    >
      {/* 助手回覆的評分按鈕 */}
      {message.role === "assistant" && showRating && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex justify-end space-x-1 mb-1"
        >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRating("good")}
              className={`h-6 w-6 p-0 transition-colors ${
                currentRating === "good"
                  ? "text-green-400 hover:text-green-300 bg-green-900/20"
                  : "text-gray-400 hover:text-green-400 hover:bg-green-900/20"
              }`}
            >
              <Smile className="w-3 h-3" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRating("bad")}
              className={`h-6 w-6 p-0 transition-colors ${
                currentRating === "bad"
                  ? "text-red-400 hover:text-red-300 bg-red-900/20"
                  : "text-gray-400 hover:text-red-400 hover:bg-red-900/20"
              }`}
            >
              <Frown className="w-3 h-3" />
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* 助手回覆的時間顯示 */}
      {message.role === "assistant" && responseTime && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex justify-end mb-1"
        >
          <div className="text-xs text-gray-500 font-mono bg-gray-800 px-2 py-1 rounded">{responseTime}ms</div>
        </motion.div>
      )}

      <div
        className={`p-3 rounded-lg ${
          message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-800 text-white border border-gray-700"
        }`}
      >
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
      </div>
    </motion.div>
  )
}
