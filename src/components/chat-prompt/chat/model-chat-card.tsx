"use client"

import React, { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { ExternalLink, Maximize2, Download } from "lucide-react"
import { motion } from "framer-motion"
import { LoadingSpinner } from "./loading-spinner"
import { MessageBubble } from "./message-bubble"
import { usePromptStore, type ModelMessage } from "@/lib/store/prompt";
import { Card } from "@/components/ui/card";

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
  setScrollRef?: (el: HTMLDivElement | null) => void;
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
  setScrollRef,
}: ModelChatCardProps) {
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (syncScroll) {
      const target = e.target as HTMLDivElement
      onSyncScroll(index, target.scrollTop, target.scrollHeight, target.clientHeight)
    }
  }

  const { modelMessages, selectedModels } = usePromptStore();
  const ifModelOverTwo = selectedModels.length > 2;

  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (setScrollRef) setScrollRef(scrollRef.current);
  }, [setScrollRef, scrollRef.current]);

  useEffect(() => {
    // if (syncScroll) return; // 只在非同步滾動時自動滾動到底部
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [model.messages.length, model.messages.map(m => m.content).join(","), syncScroll]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <div className="border rounded-lg bg-gray-900 p-4 h-full flex flex-col" style={{
          minHeight: ifModelOverTwo
            ? "calc((100vh - 80px - 48px - 160px) / 2 - 8px)"
            : "calc(100vh - 80px - 48px - 160px)",
          maxHeight: ifModelOverTwo
            ? "calc((100vh - 80px - 48px - 160px) / 2 - 8px)"
            : "calc(100vh - 80px - 48px - 160px)"
        }}>
          <div className="flex items-center justify-between mb-4">
            <div className="font-bold text-lg text-blue-300">{model.name}</div>
            <div className="flex space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => {
                      const data = {
                        model: model.name || model.id,
                        messages: model.messages.filter(m => m.role !== 'system').map(m => {
                          const msg: Record<string, any> = {
                            role: m.role,
                            content: m.content,
                          };
                          if (m.role === 'assistant' && m.hasOwnProperty('spendTime') && m.spendTime !== undefined && m.spendTime !== null) {
                            msg.spendTime = String(m.spendTime) + "ms";
                          }
                          return msg;
                        }),
                        exportedAt: new Date().toISOString(),
                      }
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${model.name || model.id}-chat.json`
                      document.body.appendChild(a)
                      a.click()
                      setTimeout(() => {
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      }, 100)
                    }} className="h-7 w-7 p-0">
                      <Download className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>下載對話紀錄</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
          <div className="border-b-1 border-gray-600 mb-5 w-[100%] relative left-1/2 -translate-x-1/2" />
          <div
            className="flex-1 overflow-y-auto"
            ref={scrollRef}
            onScroll={handleScroll}
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
    </>
  )
}
