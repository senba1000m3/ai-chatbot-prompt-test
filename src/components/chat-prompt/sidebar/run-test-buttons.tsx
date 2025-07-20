"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Play, ChevronDown } from "lucide-react"

interface RunTestButtonsProps {
  isReadOnly: boolean
  onRunTest: (times: number) => void
  runTimes: number
  setRunTimes: (times: number) => void
}

export function RunTestButtons({ isReadOnly, onRunTest, runTimes, setRunTimes }: RunTestButtonsProps) {
  return (
    <AnimatePresence>
      {!isReadOnly && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="flex space-x-3"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
            <Button
              onClick={() => onRunTest(1)}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              Run Test
            </Button>
          </motion.div>
          <div className="flex">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => onRunTest(runTimes)}
                className="bg-blue-600 text-white hover:bg-blue-700 rounded-r-none transition-colors"
                onContextMenu={(e) => {
                  e.preventDefault()
                  document.querySelector("[data-run-dropdown]")?.click()
                }}
              >
                <Play className="w-4 h-4 mr-2" />
                Run Test {runTimes} Times
              </Button>
            </motion.div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="bg-blue-600 text-white hover:bg-blue-700 rounded-l-none border-l border-blue-500 px-2 transition-colors"
                    data-run-dropdown
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-900 border-gray-800">
                {[1, 3, 5, 10, 20].map((num) => (
                  <DropdownMenuItem
                    key={num}
                    onClick={() => setRunTimes(num)}
                    className="text-white hover:bg-gray-800 transition-colors"
                  >
                    {num} 次
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
