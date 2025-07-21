"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { motion } from "framer-motion"
import { ModelChatCard } from "./model-chat-card"
import { UnifiedChatView } from "./unified-chat-view"
import { PopupViewPlaceholder } from "./popup-view-placeholder"
import { ChatInputSection } from "./chat-input-section"
import { usePromptStore, type ModelMessage, type HintMessage} from "@/lib/store/prompt"

type ViewMode = "popup" | "unified" | "separate"

interface ChatViewContainerProps {
  viewMode: ViewMode
  fullscreenModel: string | null
  setFullscreenModel: (modelId: string | null) => void
  syncScroll: boolean
  setSyncScroll: (sync: boolean) => void
  chatHeight: number
  onPopupWindow: (modelId: string) => void
  onMessageRating: (messageId: string, rating: "good" | "bad") => void
  onSyncScroll: (sourceIndex: number, scrollTop: number, scrollHeight: number, clientHeight: number) => void
  defaultHintMessages: HintMessage[]
  onHintMessageClick: (content: string) => void
  showHintButtons: boolean
  inputDisabled: boolean
  scrollRefs?: React.MutableRefObject<(HTMLDivElement | null)[]>
  messagesEndRef?: React.RefObject<HTMLDivElement>
}

export function ChatViewContainer({
  viewMode,
  fullscreenModel,
  setFullscreenModel,
  syncScroll,
  setSyncScroll,
  chatHeight,
  onPopupWindow,
  onMessageRating,
  onSyncScroll,
  defaultHintMessages,
  onHintMessageClick,
  showHintButtons,
  inputDisabled,
  scrollRefs,
  messagesEndRef,
}: Omit<ChatViewContainerProps, "inputMessage" | "setInputMessage" | "multiSendTimes" | "setMultiSendTimes" | "onSendMessage" | "modelResponses">) {
  const {
    selectedModels,
    getModelMessages,
  } = usePromptStore()

  const localScrollRefs = useRef<(HTMLDivElement | null)[]>([])
  const localMessagesEndRef = useRef<HTMLDivElement>(null)

  const actualScrollRefs = scrollRefs || localScrollRefs
  const actualMessagesEndRef = messagesEndRef || localMessagesEndRef

  const modelResponses = selectedModels.map(modelId => ({
    id: modelId,
    name: modelId,
    messages: getModelMessages(modelId),
    isLoading: false,
  }));

  // 計算每個對話框的高度 - 為輸入框預留空間
  const getIndividualChatHeight = () => {
    const modelCount = selectedModels.length
    const inputSectionHeight = 120 // 為輸入框預留的高度
    const availableHeight = chatHeight - inputSectionHeight

    if (modelCount <= 2) {
      return availableHeight
    } else if (modelCount <= 4) {
      return Math.floor((availableHeight - 16) / 2)
    } else {
      return Math.floor((availableHeight - 32) / 3)
    }
  }

  // 獲取網格布局類名
  const getGridClassName = () => {
    const modelCount = selectedModels.length
    if (modelCount <= 2) {
      return "grid grid-cols-2 gap-4"
    } else if (modelCount <= 4) {
      return "grid grid-cols-2 grid-rows-2 gap-4"
    } else {
      return "grid grid-cols-2 gap-4 overflow-y-auto"
    }
  }

  const handleUnifiedPopupWindow = () => {
    const conversationFlow: Array<{
      type: "user" | "assistant" | "system"
      content: string
      model?: string
    }> = []

    const maxLength = Math.max(...modelResponses.map((m) => m.messages.length))

    for (let i = 0; i < maxLength; i++) {
      const userMessage = modelResponses[0]?.messages[i]
      if (userMessage && userMessage.role === "user" && userMessage.content) {
        conversationFlow.push({
          type: "user",
          content: userMessage.content as string,
        })
      }

      modelResponses.forEach((model) => {
        const assistantMessage = model.messages[i]
        if (assistantMessage && assistantMessage.role === "assistant" && assistantMessage.content) {
          conversationFlow.push({
            type: "assistant",
            content: assistantMessage.content as string,
            model: model.name,
          })
        }
      })
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>統一對話框 - OCR 測試系統</title>
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
        <div class="subtitle">OCR 測試系統 - 獨立視窗</div>
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

  // 同步滾動處理函數
  const handleSyncScroll = (sourceIndex: number, scrollTop: number, scrollHeight: number, clientHeight: number) => {
    if (!syncScroll) return

    // 計算滾動百分比
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight)

    // 同步其他滾動容器
    actualScrollRefs.current.forEach((ref, index) => {
      if (ref && index !== sourceIndex) {
        const targetScrollHeight = ref.scrollHeight
        const targetClientHeight = ref.clientHeight
        const targetScrollTop = scrollPercentage * (targetScrollHeight - targetClientHeight)
        ref.scrollTop = targetScrollTop
      }
    })
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      <TooltipProvider>
        <div className="flex-1 overflow-hidden flex flex-col h-full">
          {/* 聊天區域 */}
          <div className="flex-1 p-4 overflow-hidden">
            {viewMode === "separate" && !fullscreenModel && (
              <div className="h-full relative">
                <div className={getGridClassName()} style={{ height: `${chatHeight - 120}px` }}>
                  {selectedModels.map((modelId, index) => (
                    <ModelChatCard
                      key={modelId}
                      model={{
                        id: modelId,
                        name: modelId,
                        messages: getModelMessages(modelId).filter(m => m.role !== 'system'),
                        isLoading: false,
                      }}
                      index={index}
                      scrollRef={(el) => (actualScrollRefs.current[index] = el)}
                      syncScroll={syncScroll}
                      onPopupWindow={onPopupWindow}
                      onFullscreen={setFullscreenModel}
                      chatHeight={getIndividualChatHeight()}
                      onSyncScroll={handleSyncScroll}
                      onMessageRating={onMessageRating}
                    />
                  ))}
                </div>

                <div
                  className="absolute"
                  style={{
                    top: `${(chatHeight - 120) / 2}px`,
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 10,
                  }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        animate={{ rotate: syncScroll ? 360 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Button
                          variant={syncScroll ? "default" : "secondary"}
                          size="sm"
                          onClick={() => setSyncScroll(!syncScroll)}
                          className={`w-12 h-12 rounded-full shadow-lg border-2 transition-all ${
                            syncScroll
                              ? "bg-blue-600 text-white border-blue-500 hover:bg-blue-700"
                              : "bg-gray-900 text-white border-gray-800 hover:bg-gray-800"
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            />
                          </svg>
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={10} className="z-[9999]">
                      <p>{syncScroll ? "關閉同步滾動" : "開啟同步滾動"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}

            {viewMode === "unified" && (
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <UnifiedChatView
                    modelResponses={modelResponses}
                    // messagesEndRef={actualMessagesEndRef}
                    chatHeight={chatHeight - 120}
                    onPopupWindow={handleUnifiedPopupWindow}
                    // onMessageRating={onMessageRating}
                  />
                </div>
              </div>
            )}

            {viewMode === "popup" && <PopupViewPlaceholder />}

            {fullscreenModel && (
              <div className="absolute top-0 left-0 w-full h-[80%] bg-black z-50 flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-gray-800">
                  <div className="text-lg font-semibold">
                    {modelResponses.find((m) => m.id === fullscreenModel)?.name || "Full Screen"}
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => setFullscreenModel(null)}>
                    關閉全螢幕
                  </Button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  {modelResponses
                    .find((m) => m.id === fullscreenModel)
                    ?.messages.filter(m => m.role !== 'system').map((message, msgIndex) => (
                      <motion.div
                        key={msgIndex}
                        initial={{ opacity: 0, x: message.role === "user" ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: msgIndex * 0.05, duration: 0.3 }}
                        className={`p-3 rounded-lg mb-3 ${
                          message.role === "user"
                            ? "bg-blue-600 text-white ml-8"
                            : "bg-gray-800 text-white mr-8 border border-gray-700"
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap">{message.content as string}</div>
                      </motion.div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* 输入框部分，确保它始终在可见区域内 */}
          <div className="relative bottom-22 left-0 right-0 z-10 bg-black">
            <ChatInputSection
              onHintMessageClick={onHintMessageClick}
              showHintButtons={showHintButtons}
            />
          </div>

        </div>
      </TooltipProvider>

      <div style={{ float: "left", clear: "both" }} ref={localMessagesEndRef}></div>
    </div>
  )
}
