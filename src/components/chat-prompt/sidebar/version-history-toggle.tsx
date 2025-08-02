"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { ChevronRight } from "lucide-react"
import { usePromptStore } from "@/lib/store/prompt"

export function VersionHistoryToggle({ }) {
  const { showVersionHistory, setShowVersionHistory } = usePromptStore();

  return (
    <TooltipProvider>
      <div className="flex">
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {setShowVersionHistory(!showVersionHistory)}}
                className="h-full rounded-none border-r border-gray-800 px-2 text-gray-400 hover:text-white hover:bg-gray-900"
              >
                <motion.div animate={{ rotate: showVersionHistory ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="right" className="z-[9999] bg-gray-800 border-gray-700 text-white">
            <p>{showVersionHistory ? "隱藏版本歷史" : "顯示版本歷史"}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
