"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Smile, Frown, Copy, Trash } from "lucide-react"
import { MarkdownText } from "@/components/common/typography"
import { MessageContentRenderer } from "@/components/main/chat/messages/content-renderer"
import { LoadingSpinner } from "@/components/chat-prompt/chat/loading-spinner"
import { usePromptStore, type ModelMessage } from "@/lib/store/prompt"

interface MessageBubbleProps {
  message: ModelMessage
  index: number
  modelId: string
  versionId?: string
  showRating?: boolean
  showCopyButton?: boolean
  showDeleteButton?: boolean
}

export function MessageBubble({ message, index, modelId, versionId, showRating = false, showCopyButton = true, showDeleteButton = true}: MessageBubbleProps & { messages?: ModelMessage[], onDelete?: (id: string) => void }) {
  const { updateMessageRating, getCompareModelMessages, removeModelMessage } = usePromptStore()
  const [currentRating, setCurrentRating] = useState<"good" | "bad" | null>(message.rating || null)

  const handleRating = (rating: "good" | "bad") => {
    const newRating = currentRating === rating ? null : rating
    setCurrentRating(newRating)
    if (message.id) {
      updateMessageRating(message.id, modelId, newRating, versionId)
    }

	getCompareModelMessages();
  }

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(String(message.content))
    }
  }

  const handleDelete = () => {
    if (message.id) {
      removeModelMessage(modelId, message.id)
    }
  }

  return (
    <motion.div
      key={message.id || index}
      initial={{ opacity: 0, x: message.role === "user" ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.05,
        duration: 0.3,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      className={`${message.role === "user" ? "ml-8" : "mr-8"} mb-4`}
    >
      <div
        className={`relative p-3 rounded-lg ${
          message.role === "user" ? "bg-blue-600 text-white mr-2" : "bg-gray-800 text-white border border-gray-700 ml-2"
        }`}
      >
		  <div className="text-sm">
			  {message.role === "assistant" &&  message.content === "......" ? (
				  <LoadingSpinner />
			  ) : Array.isArray(message.content) ? (
				  message.content.map((item, idx) => {
					  if (item.type === "text") {
						  return <MarkdownText key={idx}>{item.text}</MarkdownText>;
					  }
					  if (item.type === "image") {
						  return (
							  <div key={idx} className="my-2">
								  <img src={item.image} alt="image" className="max-w-xs max-h-40 rounded border" />
							  </div>
						  );
					  }
					  return null;
				  })
			  ) : null}
		  </div>
      </div>

      {/* spendTime 與 ICON 區塊（spinner 時不顯示 ICON） */}
      {(message.role === "assistant" && message.spendTime && message.content !== "......") ? (
        <div className="flex justify-end items-center mt-2">
          <div
            className={`text-xs font-mono px-2 py-1 rounded bg-gray-800 mr-2 ${
              message.spendTime <= 3000
                ? 'text-green-400'
                : message.spendTime <= 10000
                ? 'text-yellow-400'
                : 'text-red-400'
            }`}
          >
            {message.spendTime}ms
          </div>
          <div className="flex space-x-1 mr-1">
			  {showCopyButton && <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={handleCopy} title="複製">
				  <Copy className="w-4 h-4" />
			  </Button>}
			  {showDeleteButton && <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={handleDelete} title="刪除">
				  <Trash className="w-4 h-4" />
			  </Button>}
          </div>
        </div>
      ) : (
        message.content !== "......" && (
          <div className="flex justify-end items-center mt-2 mr-3">
            <div className="flex space-x-1">
				{showCopyButton && <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={handleCopy} title="複製">
                	<Copy className="w-4 h-4" />
              	</Button>}
				{showDeleteButton && <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={handleDelete} title="刪除">
					<Trash className="w-4 h-4" />
				</Button>}
            </div>
          </div>
        )
      )}
    </motion.div>
  )
}
