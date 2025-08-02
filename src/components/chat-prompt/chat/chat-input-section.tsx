"use client"

import { HintMessageButtons } from "./hint-message-buttons"
import { EnhancedMessageInput } from "./enhanced-message-input"
import { usePromptStore } from "@/lib/store/prompt";
import { X } from "lucide-react"

interface HintMessage {
  id: string
  content: string
}

interface ChatInputSectionProps {
  onHintMessageClick: (content: string) => void
  showHintButtons: boolean
  inputMessage: string
  setInputMessage: (value: string) => void
  onSendMessage: (times?: number) => void
  multiSendTimes: number
  setMultiSendTimes: (times: number) => void
}

export function ChatInputSection({
  onHintMessageClick,
  showHintButtons,
}: Omit<ChatInputSectionProps, "inputMessage" | "setInputMessage" | "onSendMessage" | "multiSendTimes" | "setMultiSendTimes">) {
  const {
    inputMessage,
    setInputMessage,
    selectedImage,
    addSelectedImage,
    removeSelectedImage,
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
    <div className="border-t border-gray-800 bg-black relative">
      {/* 圖片預覽浮動層，與 HintMessageButtons 同一層，並放在前面 */}
      <div className="flex items-center px-3 pt-1">
		  {selectedImage && selectedImage.length > 0 && (
			  <div className="inline-flex align-top max-w-xs relative py-2 gap-4" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
				  {selectedImage.map((img, idx) => (
					  <div key={img} className="relative inline-block">
						  <img src={img} alt={`預覽圖片${idx+1}`} className="max-h-13 rounded border-5 border-red" style={{ display: 'block' }} />
						  <button
							  className="absolute top-1 right-0 text-red-600 rounded-full flex items-center justify-center shadow-lg z-10 transition-transform duration-150 hover:scale-105 hover:bg-red-100"
							  style={{ fontWeight: 'bold', fontSize: '1rem', lineHeight: '1rem', transform: 'translate(50%,-50%)' }}
							  onClick={() => removeSelectedImage(img)}
							  aria-label="關閉圖片預覽"
						  >
							  <X className="w-5 h-5" />
						  </button>
					  </div>
				  ))}
			  </div>
		  )}
		  {/* 預設提示按鈕 */}
		  <div className="inline-block w-auto px-2 pt-4 align-top">
			  <HintMessageButtons />
		  </div>
	  </div>
      {/* 輸入框 */}
      <div className="p-4 pt-1">
        <EnhancedMessageInput />
      </div>
    </div>
  )
}
