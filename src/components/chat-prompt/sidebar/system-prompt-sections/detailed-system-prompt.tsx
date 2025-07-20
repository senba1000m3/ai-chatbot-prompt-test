"use client"

import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"

interface DetailedSystemPromptProps {
  title: string
  value: string
  onChange: (value: string) => void
  isReadOnly: boolean
  isEnabled?: boolean
  onToggleEnabled?: (enabled: boolean) => void
}

export function DetailedSystemPrompt({
  title,
  value,
  onChange,
  isReadOnly,
  isEnabled = true,
  onToggleEnabled,
}: DetailedSystemPromptProps) {
  return (
    <div>
      {onToggleEnabled && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-white text-base">{title}</h4>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onToggleEnabled(!isEnabled)}
              className={`w-8 h-4 rounded-full transition-colors duration-200 ${
                isEnabled ? "bg-blue-600" : "bg-gray-600"
              } relative`}
              // disabled={isReadOnly}
            >
              <motion.div
                animate={{ x: isEnabled ? 16 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-4 h-4 bg-white rounded-full absolute top-0 left-0"
              />
            </motion.button>
          </div>
        </div>
      )}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`輸入${title}內容...`}
        className="min-h-24 bg-gray-900 border-gray-800 text-white resize-both focus:border-blue-500 focus:ring-blue-500 transition-colors"
        disabled={isReadOnly || !isEnabled}
      />
    </div>
  )
}
