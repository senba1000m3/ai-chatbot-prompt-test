"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
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

  const handleSyncScroll = (sourceIndex: number, scrollTop: number, scrollHeight: number, clientHeight: number) => {
    if (!syncScroll) return

    const denominator = scrollHeight - clientHeight
    const scrollPercentage = denominator > 0 ? scrollTop / denominator : 0

    actualScrollRefs.current.forEach((ref, index) => {
      if (ref && index !== sourceIndex) {
        const targetScrollHeight = ref.scrollHeight
        const targetClientHeight = ref.clientHeight
        const targetDenominator = targetScrollHeight - targetClientHeight
        const targetScrollTop = targetDenominator > 0 ? scrollPercentage * targetDenominator : 0
        ref.scrollTop = targetScrollTop
      }
    })
  }

  // 單一卡片彈窗
  const handlePopupWindow = (modelId: string) => {
    const model = modelResponses.find((m) => m.id === modelId)
    if (!model) return
    const messages = model.messages.filter(m => m.role !== 'system')
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${model.name} 對話 - 聊天 Prompt 產線</title>
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
        <div class="title">${model.name} 對話</div>
        <div class="subtitle">聊天 Prompt 產線 - 獨立視窗</div>
      </div>
      <div class="messages">
        ${
          messages.length === 0
            ? '<div class="no-messages">尚無對話記錄</div>'
            : messages
                .map(
                  (item) => `
            <div class="message ${item.role === "user" ? "user-message" : "assistant-message"}">
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
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      <TooltipProvider>
        <div className="flex-1 overflow-hidden flex flex-col h-full">
          {/* 聊天區域 */}
          <div className="flex-1 p-4 overflow-hidden">
            {viewMode === "separate" && !fullscreenModel && (
              <div className="relative">
                <div className={getGridClassName()}>
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
                      syncScroll={syncScroll}
                      onPopupWindow={() => handlePopupWindow(modelId)}
                      onFullscreen={setFullscreenModel}
                      chatHeight={getIndividualChatHeight()}
                      onSyncScroll={handleSyncScroll}
                      onMessageRating={onMessageRating}
                      setScrollRef={el => { actualScrollRefs.current[index] = el; }}
                    />
                  ))}
                </div>

                <div
                  className="absolute"
                  style={{
                    top: "calc((100vh - 80px - 48px - 160px) / 2)",
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
              <UnifiedChatView
                modelResponses={modelResponses}
                chatHeight={chatHeight - 120}
              />
            )}

            {viewMode === "popup" && <PopupViewPlaceholder />}

            {fullscreenModel && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed top-0 left-0 right-0 bottom-0 z-[70] bg-black/90 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  transition={{
                    duration: 0.3,
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  className="h-full p-4"
                >
                  <Card className="h-full bg-gray-900 border-gray-800 flex flex-col shadow-2xl">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.2 }}
                      className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-800"
                    >
                      <h3 className="font-medium text-white">
                        {modelResponses.find((m) => m.id === fullscreenModel)?.name || "Full Screen"} - 全螢幕檢視
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFullscreenModel(null)}
                          className="text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                        >
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </motion.div>
                        </Button>
                      </div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="flex-1 p-3 overflow-y-auto space-y-3"
                    >
                      {(() => {
                        const model = modelResponses.find((m) => m.id === fullscreenModel)
                        if (!model)
                          return (
                            <div className="text-center text-gray-400 py-8">
                              <p>版本不存在</p>
                            </div>
                          )
                        const messages = model.messages.filter(m => m.role !== 'system')
                        return messages.length === 0 ? (
                          <div className="text-center text-gray-400 py-8">
                            <p>尚無訊息</p>
                          </div>
                        ) : (
                          messages.map((message, msgIndex) => (
                            <motion.div
                              key={message.id || msgIndex}
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
                          ))
                        )
                      })()}
                    </motion.div>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* 输入框部分，确保它始终在可见区域内 */}
          <div className="relative bottom-18 left-0 right-0 z-10 bg-black">
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
