"use client"

import type React from "react"
import { useState } from "react"
import { usePromptStore } from "@/lib/store/prompt"
import { usePromptChat } from "@/hooks/use-prompt-chat"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Send, ChevronUpIcon } from "lucide-react"
import { UploadButton } from "@/components/chat-prompt/upload-button"

export function EnhancedMessageInput() {
  const {
    inputMessage,
    setInputMessage,
    ifShowHintMessage,
    setIfShowHintMessage,
    setInputSendTimes,
    ifInputDisabled,
    setIfInputDisabled,
    removeSelectedImage,
    selectedImage
  } = usePromptStore();
  const { handleSubmit } = usePromptChat();

  const [multiSendTimes, setMultiSendTimes] = useState(5);
  const [isComposing, setIsComposing] = useState(false);
  const placeholderText = ifInputDisabled ? "請點擊清除並重新開始對話！" : "輸入訊息...";
  const cursorClass = ifInputDisabled ? "cursor-not-allowed" : "";



  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage) return;
    if (ifShowHintMessage){
      setIfShowHintMessage(false);
    }

    await handleSubmit(inputMessage);
    setInputMessage("");
    removeSelectedImage();
  };

  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !ifInputDisabled) {
      e.preventDefault();
      setInputSendTimes(1);

      await handleSendMessage();
    }
  };

  return (
    <div className="flex space-x-2">
	  <UploadButton />
		<Input
			value={inputMessage}
			onChange={(e) => setInputMessage(e.target.value)}
			onCompositionStart={() => setIsComposing(true)}
			onCompositionEnd={() => setIsComposing(false)}
			placeholder={placeholderText}
			className={`flex-1 bg-gray-900 border-gray-800 text-white h-10 focus:border-blue-500 focus:ring-blue-500 transition-colors ${cursorClass}`}
			disabled={ifInputDisabled}
			onKeyPress={handleKeyPress}
		/>
      <motion.div whileHover={{ scale: ifInputDisabled ? 1 : 1.05 }} whileTap={{ scale: ifInputDisabled ? 1 : 0.95 }}>
        <Button
          onClick={() =>{
            setInputSendTimes(1);
            handleSendMessage();
          }}
          size="sm"
          className="h-10 px-4 bg-blue-600 hover:bg-blue-700 transition-colors"
          disabled={ifInputDisabled || !inputMessage.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </motion.div>
      <div className="flex">
        <motion.div whileHover={{ scale: ifInputDisabled ? 1 : 1.05 }} whileTap={{ scale: ifInputDisabled ? 1 : 0.95 }}>
          <Button
            onClick={() =>{
              setInputSendTimes(multiSendTimes);
              setIfInputDisabled(true)
              handleSendMessage();
            }}
            className="bg-green-600 hover:bg-green-700 rounded-r-none transition-colors h-10"
            disabled={ifInputDisabled || !inputMessage.trim()}
          >
            <Send className="w-4 h-4 mr-2" />
            發送 {multiSendTimes} 次
          </Button>
        </motion.div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: ifInputDisabled ? 1 : 1.05 }} whileTap={{ scale: ifInputDisabled ? 1 : 0.95 }}>
              <Button
                className="bg-green-600 hover:bg-green-700 rounded-l-none border-l border-green-500 px-2 transition-colors h-10"
                disabled={ifInputDisabled}
              >
                <ChevronUpIcon className="w-4 h-4" />
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-900 border-gray-800">
            {[1, 3, 5, 10, 20].map((num) => (
              <DropdownMenuItem
                key={num}
                onClick={() => setMultiSendTimes(num)}
                className="text-white hover:bg-gray-800 transition-colors"
              >
                {num} 次
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
