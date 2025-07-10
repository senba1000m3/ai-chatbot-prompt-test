"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

interface HintMessage {
  id: string
  content: string
}

interface HintMessageButtonsProps {
  messages: HintMessage[]
  onMessageClick: (content: string) => void
  show: boolean
}

export function HintMessageButtons({ messages, onMessageClick, show }: HintMessageButtonsProps) {
  return (
    <AnimatePresence>
      {show && messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap gap-2 mb-4"
        >
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMessageClick(message.content)}
                className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                {message.content.length > 20 ? `${message.content.substring(0, 20)}...` : message.content}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
