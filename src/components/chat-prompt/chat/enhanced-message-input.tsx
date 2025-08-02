"use client"

import type React from "react"
import { useState } from "react"
import { usePromptStore } from "@/lib/store/prompt"
import { usePromptChat } from "@/hooks/use-prompt-chat"

import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Send, ChevronUpIcon, Paperclip, X } from "lucide-react"

export function EnhancedMessageInput() {
  const {
    inputMessage,
    setInputMessage,
    ifShowHintMessage,
    setIfShowHintMessage,
    inputSendTimes,
    setInputSendTimes,
    ifInputDisabled,
    setIfInputDisabled,
    addSelectedImage,
    removeSelectedImage,
    selectedImage
  } = usePromptStore();
  const { handleSubmit } = usePromptChat();

  const [multiSendTimes, setMultiSendTimes] = useState(5);
  const [isComposing, setIsComposing] = useState(false);
  const [_selectedImage, _setSelectedImage] = useState<File | null>(null);
  const placeholderText = ifInputDisabled ? "請點擊清除並重新開始對話！" : "輸入訊息...";
  const cursorClass = ifInputDisabled ? "cursor-not-allowed" : "";

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const img = e.target.files[0];

			if (img.type === "image/jpeg" || img.type === "image/png") {
				const formData = new FormData();
				formData.append("file", img);

				try {
					const res = await fetch("/api/upload/images", {
						method: "POST",
						body: formData,
					});

					if (!res.ok) {
						const errorData = await res.json();
						alert(`上傳失敗: ${errorData.error || "未知錯誤"}`);
						return;
					}

					const data = await res.json();
					const imageUrl = data.url;
					const fullUrl = `${window.location.origin}${imageUrl}`;

					_setSelectedImage(img);
					addSelectedImage(fullUrl);
					console.log("圖片網址:", fullUrl);
				} catch (error) {
					console.error("上傳圖片時發生錯誤:", error);
					alert("上傳失敗，請稍後再試。");
				}
			} else {
				alert("請選擇 jpg 或 png 格式的圖片。");
				_setSelectedImage(null);
				removeSelectedImage();
			}
		}

		e.target.value = '';
	};

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !_selectedImage) return;
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
		<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
			<Button
				size="sm"
				className="h-10 px-4 bg-blue-600 hover:bg-blue-700 transition-colors"
				onClick={() => {
					const fileInput = document.getElementById("image-upload") as HTMLInputElement;
					if (fileInput) fileInput.click();
				}}
			>
				<Paperclip className="w-4 h-4" />
			</Button>
			<input
				type="file"
				accept="image/jpeg, image/png"
				onChange={handleImageChange}
				className="hidden"
				id="image-upload"
				multiple
				/>
		</motion.div>
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
