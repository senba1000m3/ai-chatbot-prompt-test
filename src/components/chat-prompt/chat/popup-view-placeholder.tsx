"use client"

import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"

export function PopupViewPlaceholder() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full flex items-center justify-center"
    >
      <div className="text-gray-400 text-center">
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}>
          <ExternalLink className="w-12 h-12 mx-auto mb-4" />
        </motion.div>
        <p>彈出視窗模式（目前未添加）</p>
        <p className="text-sm">對話框將在新視窗中開啟</p>
      </div>
    </motion.div>
  )
}
