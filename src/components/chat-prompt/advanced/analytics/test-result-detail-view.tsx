"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageBubble } from "@/components/chat-prompt/chat/message-bubble"
import { usePromptStore } from "@/lib/store/prompt"
import type { TestResult } from "@/lib/store/advanced"
import type { ModelMessage } from "@/lib/store/prompt"

interface TestResultDetailViewProps {
  result: TestResult | null
  isOpen: boolean
  onClose: () => void
}

export const TestResultDetailView = ({ result, isOpen, onClose }: TestResultDetailViewProps) => {
  const { savedVersions } = usePromptStore()

  if (!result) return null

  const getVersionName = (versionId: string) => {
    const version = savedVersions.find(v => v.id === versionId)
    return version ? version.name : "未知版本"
  }

  const messages: ModelMessage[] = Object.values(result.messages[result.versionId]?.[result.modelId] || {})

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>對話紀錄詳情</DialogTitle>
          <DialogDescription asChild>
            <div className="flex items-center space-x-2 pt-1">
              <span>版本:</span>
              <Badge variant="outline">{getVersionName(result.versionId)}</Badge>
              <span>模型:</span>
              <Badge variant="secondary">{result.modelId}</Badge>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/30 rounded-md">
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <MessageBubble
                key={message.id || index}
                message={message}
                index={index}
                modelId={result.modelId}
                versionId={result.versionId}
                showRating={false}
                showDeleteButton={false}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>沒有對話紀錄</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">關閉</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

