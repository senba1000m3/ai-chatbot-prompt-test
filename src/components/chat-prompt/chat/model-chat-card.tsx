"use client"

import React, { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { ExternalLink, Maximize2 } from "lucide-react"
import { motion } from "framer-motion"
import { LoadingSpinner } from "./loading-spinner"
import { MessageBubble } from "./message-bubble"
import { usePromptStore, type ModelMessage } from "@/lib/store/prompt";

interface ModelResponse {
  id: string
  name: string
  messages: ModelMessage[]
  isLoading: boolean
}

interface ModelChatCardProps {
  model: ModelResponse
  index: number
  syncScroll: boolean
  onPopupWindow: (modelId: string) => void
  onFullscreen: (modelId: string) => void
  chatHeight: number
  onSyncScroll: (sourceIndex: number, scrollTop: number, scrollHeight: number, clientHeight: number) => void
  onMessageRating: (messageId: string, rating: "good" | "bad") => void
}

export function ModelChatCard({
  model,
  index,
  syncScroll,
  onPopupWindow,
  onFullscreen,
  chatHeight,
  onSyncScroll,
  onMessageRating,
}: ModelChatCardProps) {
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (syncScroll) {
      const target = e.target as HTMLDivElement
      onSyncScroll(index, target.scrollTop, target.scrollHeight, target.clientHeight)
    }
  }

  const scrollRef = useRef<HTMLDivElement>(null);
  const { modelMessages } = usePromptStore();

  useEffect(() => {
	const scrollToBottom = () => {
		if (scrollRef && scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	};

    scrollToBottom();
  }, [modelMessages.length, model.messages.map(m => m.content).join(",")]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="border rounded-lg bg-gray-900 p-4 h-full flex flex-col" style={{ minHeight: chatHeight }}>
        <div className="flex items-center justify-between mb-2">
          <div className="font-bold text-lg text-blue-300">{model.name || model.id}</div>
          <div className="flex space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => onPopupWindow(model.id)} className="h-7 w-7 p-0">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>在新視窗開啟</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => onFullscreen(model.id)} className="h-7 w-7 p-0">
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>全螢幕檢視</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div
          className="flex-1 overflow-y-auto"
          ref={scrollRef}
          onScroll={handleScroll}
          style={{ maxHeight: chatHeight - 48 }}
        >
          {model.messages.length === 0 ? (
            <div className="text-gray-500 text-center mt-8">尚無訊息</div>
          ) : (
            model.messages.map((msg, i) => (
              <MessageBubble
                key={msg.id || i}
                message={msg}
                modelId={model.id}
                index={i}
                showRating={false}
              />
            ))
          )}
        </div>
      </div>
    </motion.div>
  )
}
