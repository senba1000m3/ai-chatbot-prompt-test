"use client"

import { Textarea } from "@/components/ui/textarea"

interface DetailedSystemPromptProps {
  title: string
  value: string
  onChange: (value: string) => void
  isReadOnly: boolean
}

export function DetailedSystemPrompt({ title, value, onChange, isReadOnly }: DetailedSystemPromptProps) {
  return (
    <div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`輸入${title}內容...`}
        className="min-h-24 bg-gray-900 border-gray-800 text-white resize-both focus:border-blue-500 focus:ring-blue-500 transition-colors"
        disabled={isReadOnly}
      />
    </div>
  )
}
