"use client"

import { motion } from "framer-motion"

interface Message {
  role: "user" | "assistant"
  content: string
  model?: string
}

interface MessageBubbleProps {
  message: Message
  index: number
}

export function MessageBubble({ message, index }: MessageBubbleProps) {
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
      className={`p-3 rounded-lg ${
        message.role === "user" ? "bg-blue-600 text-white ml-8" : "bg-gray-800 text-white mr-8 border border-gray-700"
      }`}
    >
      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
    </motion.div>
  )
}
