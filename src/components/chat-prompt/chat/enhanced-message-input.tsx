"use client"

import type React from "react"
import { useState } from "react"
import { usePromptStore } from "@/lib/store/prompt"
import { usePromptChat } from "@/hooks/use-prompt-chat"

import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Send, ChevronUpIcon } from "lucide-react"

export function EnhancedMessageInput({ disabled }: { disabled: boolean }) {
  const {
    inputMessage,
    setInputMessage,
    multiSendTimes,
    setMultiSendTimes,
  } = usePromptStore();
  const { handleSubmit } = usePromptChat();

  const [isComposing, setIsComposing] = useState(false);
  const placeholderText = disabled ? "請點擊清除並重新開始對話！" : "輸入訊息...";
  const cursorClass = disabled ? "cursor-not-allowed" : "";

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    await handleSubmit(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault();
      await handleSendMessage();
    }
  };

  return (
    <div className="flex space-x-2">
      <Input
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        placeholder={placeholderText}
        className={`flex-1 bg-gray-900 border-gray-800 text-white h-10 focus:border-blue-500 focus:ring-blue-500 transition-colors ${cursorClass}`}
        disabled={disabled}
        onKeyPress={handleKeyPress}
      />
      <motion.div whileHover={{ scale: disabled ? 1 : 1.05 }} whileTap={{ scale: disabled ? 1 : 0.95 }}>
        <Button
          onClick={handleSendMessage}
          size="sm"
          className="h-10 px-4 bg-blue-600 hover:bg-blue-700 transition-colors"
          disabled={disabled || !inputMessage.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </motion.div>
      <div className="flex">
        <motion.div whileHover={{ scale: disabled ? 1 : 1.05 }} whileTap={{ scale: disabled ? 1 : 0.95 }}>
          <Button
            onClick={handleSendMessage} // Note: multiSendTimes is not handled by the new hook
            className="bg-green-600 hover:bg-green-700 rounded-r-none transition-colors h-10"
            disabled={disabled || !inputMessage.trim()}
          >
            <Send className="w-4 h-4 mr-2" />
            發送 {multiSendTimes} 次
          </Button>
        </motion.div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: disabled ? 1 : 1.05 }} whileTap={{ scale: disabled ? 1 : 0.95 }}>
              <Button
                className="bg-green-600 hover:bg-green-700 rounded-l-none border-l border-green-500 px-2 transition-colors h-10"
                disabled={disabled}
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
