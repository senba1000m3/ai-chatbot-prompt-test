"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { ExternalLink } from "lucide-react"
import { MessageBubble } from "./message-bubble"
import { LoadingSpinner } from "./loading-spinner"
import type { RefObject } from "react"

interface Message {
  role: "user" | "assistant"
  content: string
  model?: string
  rating?: "good" | "bad" | null
  id?: string
}

interface ModelResponse {
  id: string
  name: string
  messages: Message[]
  isLoading: boolean
}

interface ModelChatCardProps {
  model: ModelResponse
  index: number
  scrollRef: RefObject<HTMLDivElement>
  syncScroll: boolean
  onPopupWindow: (modelId: string) => void
  onFullscreen: (modelId: string) => void
  chatHeight: number
  onSyncScroll: (sourceIndex: number, scrollTop: number, scrollHeight: number, clientHeight: number) => void
  onMessageRating?: (messageId: string, rating: "good" | "bad") => void
}

export function ModelChatCard({
  model,
  index,
  scrollRef,
  syncScroll,
  onPopupWindow,
  onFullscreen,
  chatHeight,
  onSyncScroll,
  onMessageRating,
}: ModelChatCardProps) {
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (syncScroll) {
      const target = e.currentTarget
      onSyncScroll(index, target.scrollTop, target.scrollHeight, target.clientHeight)
    }
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="h-full"
    >
      <TooltipProvider>
        <Card className="flex flex-col bg-gray-900 border-gray-800" style={{ height: `${chatHeight}px` }}>
          <div className="p-3 border-b border-gray-800 flex justify-between items-center flex-shrink-0 bg-gray-800">
            <h3 className="font-medium text-white">{model.name}</h3>
            <div className="flex space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                      onClick={() => onPopupWindow(model.id)}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="z-[9999] bg-gray-800 border-gray-700 text-white">
                  <p>彈出視窗</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                      onClick={() => onFullscreen(model.id)}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                      </svg>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="z-[9999] bg-gray-800 border-gray-700 text-white">
                  <p>全螢幕</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div
            ref={scrollRef}
            className="flex-1 p-3 overflow-y-auto min-h-0 custom-scrollbar"
            style={{
              maxHeight: `${chatHeight - 60}px`,
              height: `${chatHeight - 60}px`,
            }}
            onScroll={handleScroll}
          >
            <div className="space-y-3">
              {model.messages.map((message, msgIndex) => (
                <MessageBubble
                  key={msgIndex}
                  message={message}
                  index={msgIndex}
                  onRating={onMessageRating}
                  showRating={message.role === "assistant"}
                />
              ))}
              {model.isLoading && <LoadingSpinner />}
            </div>
          </div>
        </Card>
      </TooltipProvider>
    </motion.div>
  )
}
