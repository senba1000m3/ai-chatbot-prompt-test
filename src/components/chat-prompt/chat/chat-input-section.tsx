"use client"

import { HintMessageButtons } from "./hint-message-buttons"
import { EnhancedMessageInput } from "./enhanced-message-input"
import { usePromptStore } from "@/lib/store/prompt";

interface HintMessage {
  id: string
  content: string
}

interface ChatInputSectionProps {
  defaultHintMessages: HintMessage[]
  onHintMessageClick: (content: string) => void
  showHintButtons: boolean
  inputMessage: string
  setInputMessage: (value: string) => void
  onSendMessage: (times?: number) => void
  multiSendTimes: number
  setMultiSendTimes: (times: number) => void
  inputDisabled: boolean
}

export function ChatInputSection({
  defaultHintMessages,
  onHintMessageClick,
  showHintButtons,
  inputDisabled,
}: Omit<ChatInputSectionProps, "inputMessage" | "setInputMessage" | "onSendMessage" | "multiSendTimes" | "setMultiSendTimes">) {
  const {
    inputMessage,
    setInputMessage,
    multiSendTimes,
    setMultiSendTimes,
  } = usePromptStore();

  function onSendMessage(times: number = 1) {
    if (!inputMessage.trim()) return;
    // append 訊息到 modelResponses
    const newResponse = {
      id: Date.now().toString(),
      name: "user",
      messages: [{ role: "user", content: inputMessage }],
      isLoading: false,
    };

    setInputMessage("");
  }

  return (
    <div className="border-t border-gray-800 bg-black">
      {/* 預設提示按鈕 */}
      <div className="p-4 pb-1">
        <HintMessageButtons messages={defaultHintMessages} onMessageClick={onHintMessageClick} show={showHintButtons} />
      </div>

      {/* 輸入框 */}
      <div className="p-4 pt-1">
        <EnhancedMessageInput
          disabled={inputDisabled}
        />
      </div>
    </div>
  )
}
