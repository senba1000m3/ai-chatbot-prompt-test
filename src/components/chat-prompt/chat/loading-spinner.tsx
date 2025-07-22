"use client"

import { motion } from "framer-motion"

export function LoadingSpinner() {
  return (
	  <motion.div className="flex items-center space-x-2"
				  initial={{ opacity: 0, scale: 0.9 }}
				  animate={{ opacity: 1, scale: 1 }}>
		  <motion.div
			  animate={{ rotate: 360 }}
			  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
			  className="rounded-full h-4 w-4 border-b-2 border-blue-500"
		  />
		  <span>正在生成回應...</span>
	  </motion.div>
  )
}
