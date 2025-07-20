"use client"

import { motion } from "framer-motion"

export function LoadingSpinner() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-800 text-white mr-8 p-3 rounded-lg border border-gray-700"
    >
      <div className="flex items-center space-x-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="rounded-full h-4 w-4 border-b-2 border-blue-500"
        />
        <span>正在生成回應...</span>
      </div>
    </motion.div>
  )
}
