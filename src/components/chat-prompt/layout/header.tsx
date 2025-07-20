"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Home, User, Sun, Monitor, RotateCcw } from "lucide-react"

export function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex items-center space-x-4"
        >
          <h1 className="text-xl font-bold text-white">聊天 Prompt 測試區</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Home className="w-4 h-4" />
            <span>Prompt 測試區</span>
            {/*<span>{">"}</span>*/}
            {/*<span>中文直書作文</span>*/}
          </div>
        </motion.div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex items-center space-x-4"
        >
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <User className="w-4 h-4" />
            <span>千羽 (更換暱稱)</span>
          </div>
          <div className="flex items-center space-x-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Sun className="w-4 h-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Monitor className="w-4 h-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.header>
  )
}
