"use client"

import { motion } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"

interface PromptInputsProps {
  systemPrompt: string
  setSystemPrompt: (value: string) => void
  userPrompt: string
  setUserPrompt: (value: string) => void
  isReadOnly: boolean
}

export function PromptInputs({
  systemPrompt,
  setSystemPrompt,
  userPrompt,
  setUserPrompt,
  isReadOnly,
}: PromptInputsProps) {
  return (
    <>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <label className="block text-sm font-medium mb-2 text-white">System Prompt</label>
        <Textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="輸入系統提示詞..."
          className="min-h-32 bg-gray-900 border-gray-800 text-white resize-both focus:border-blue-500 focus:ring-blue-500 transition-colors"
          disabled={isReadOnly}
        />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <label className="block text-sm font-medium mb-2 text-white">User Prompt</label>
        <Textarea
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="輸入用戶提示詞..."
          className="min-h-32 bg-gray-900 border-gray-800 text-white resize-both focus:border-blue-500 focus:ring-blue-500 transition-colors"
          disabled={isReadOnly}
        />
      </motion.div>
    </>
  )
}
