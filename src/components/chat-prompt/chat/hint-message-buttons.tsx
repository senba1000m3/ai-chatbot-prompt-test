"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { usePromptChat } from "@/hooks/use-prompt-chat"
import { usePromptStore, type HintMessage } from "@/lib/store/prompt"
import { useState } from "react"

export function HintMessageButtons() {
	const { handleSubmit } = usePromptChat();
	const { hintMessage, ifShowHintMessage, setIfShowHintMessage } = usePromptStore();

	const handleSendMessage = async (msg: string) => {
		await handleSubmit(msg);
		setIfShowHintMessage(false)
	};

  return (
    <AnimatePresence>
      {ifShowHintMessage && hintMessage.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap gap-2 mb-4"
        >
          {hintMessage.map((message, index) => (
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
                onClick={() => handleSendMessage(message.content)}
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
