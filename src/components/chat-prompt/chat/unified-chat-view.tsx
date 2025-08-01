"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { ExternalLink } from "lucide-react"
import { LoadingSpinner } from "./loading-spinner"
import type { RefObject } from "react"
import { type ModelMessage } from "@/lib/store/prompt"
import React from "react"


interface ModelResponse {
  id: string
  name: string
  messages: ModelMessage[]
  isLoading: boolean
}

interface UnifiedChatViewProps {
  modelResponses: ModelResponse[]
  chatHeight: number
  onPopupWindow?: () => void
  onFullscreen?: () => void
}

export function UnifiedChatView({
  modelResponses,
  chatHeight,
  onPopupWindow,
  onFullscreen,
}: UnifiedChatViewProps) {
  const conversationFlow: Array<{
    type: "user" | "assistant"
    content: string
    model?: string
    responseTime?: number
  }> = []

  const maxLength = Math.max(...modelResponses.map((m) => m.messages.length))

  for (let i = 0; i < maxLength; i++) {
    const userMessage = modelResponses[0]?.messages[i]
    if (userMessage && userMessage.role === "user") {
      conversationFlow.push({
        type: "user",
        content: userMessage.content as string,
      })
    }

    modelResponses.forEach((model) => {
      const assistantMessage = model.messages[i]
      if (assistantMessage && assistantMessage.role === "assistant") {
        conversationFlow.push({
          type: "assistant",
          content: assistantMessage.content as string,
          model: model.name,
          // responseTime: assistantMessage,
        })
      }
    })
  }

  const handlePopupWindow = () => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>統一對話框 - 聊天 Prompt 產線</title>
      <style>
        body {
          margin: 0;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #000;
          color: #fff;
          line-height: 1.6;
        }
        .header {
          border-bottom: 1px solid #374151;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .subtitle {
          color: #9CA3AF;
          font-size: 14px;
        }
        .messages {
          max-width: 800px;
          margin: 0 auto;
        }
        .message {
          margin-bottom: 16px;
          padding: 12px 16px;
          border-radius: 8px;
          max-width: 80%;
        }
        .user-message {
          background: #2563EB;
          margin-left: auto;
          text-align: right;
        }
        .assistant-message {
          background: #374151;
          border: 1px solid #4B5563;
          margin-right: auto;
        }
        .model-label {
          font-size: 12px;
          color: #9CA3AF;
          margin-bottom: 4px;
        }
        .message-content {
          white-space: pre-wrap;
          font-size: 14px;
        }
        .no-messages {
          text-align: center;
          color: #9CA3AF;
          padding: 40px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">統一對話框</div>
        <div class="subtitle">聊天 Prompt 產線 - 獨立視窗</div>
      </div>
      <div class="messages">
        ${
          conversationFlow.length === 0
            ? '<div class="no-messages">尚無對話記錄</div>'
            : conversationFlow
                .map(
                  (item) => `
            <div class="message ${item.type === "user" ? "user-message" : "assistant-message"}">
              ${item.type === "assistant" && item.model ? `<div class="model-label">${item.model}</div>` : ""}
              <div class="message-content">${item.content}</div>
            </div>
          `,
                )
                .join("")
        }
      </div>
    </body>
    </html>
  `

    const newWindow = window.open("", "_blank")
    if (newWindow) {
      newWindow.document.write(htmlContent)
      newWindow.document.close()
    }
  }

  return (
    <TooltipProvider>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="bg-gray-900 border-gray-800 flex flex-col" style={{ height: `${chatHeight}px` }}>
          <div className="p-3 border-b border-gray-800 bg-gray-800 flex justify-between items-center flex-shrink-0">
            <h3 className="font-medium text-white">統一對話框</h3>
            <div className="flex space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                      onClick={onPopupWindow || handlePopupWindow}
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
                      onClick={onFullscreen}
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
          <div className="flex-1 p-3 overflow-y-auto space-y-3 min-h-0">
            {conversationFlow.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: item.type === "user" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                {item.type === "assistant" && <div className="text-xs text-gray-400 mb-1">{item.model}</div>}
                {item.type === "assistant" && item.responseTime && (
                  <div className="flex justify-start mb-1">
                    <div className="text-xs text-gray-500 font-mono bg-gray-800 px-2 py-1 rounded mr-8">
                      {item.responseTime}ms
                    </div>
                  </div>
                )}
                <div
                  className={`p-3 rounded-lg ${
                    item.type === "user"
                      ? "bg-blue-600 text-white ml-8"
                      : "bg-gray-800 text-white mr-8 border border-gray-700"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{item.content}</div>
                </div>
              </motion.div>
            ))}
            {modelResponses.some((m) => m.isLoading) && <LoadingSpinner />}
          </div>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}
