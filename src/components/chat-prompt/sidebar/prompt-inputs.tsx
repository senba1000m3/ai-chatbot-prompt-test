"use client"

import { motion } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import { SystemPromptEditor } from "./system-prompt-editor"

interface PromptInputsProps {
	systemPrompt: string
	setSystemPrompt: (value: string) => void
	userPrompt: string
	setUserPrompt: (value: string) => void
	isReadOnly: boolean
	onDownloadXML?: () => void
}

export function PromptInputs({
								 systemPrompt,
								 setSystemPrompt,
								 userPrompt,
								 setUserPrompt,
								 isReadOnly,
								 onDownloadXML,
							 }: PromptInputsProps) {
	return (
		<>
			<motion.div
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.2, duration: 0.3 }}
			>
				<SystemPromptEditor
					systemPrompt={systemPrompt}
					setSystemPrompt={setSystemPrompt}
					isReadOnly={isReadOnly}
					onDownloadXML={onDownloadXML}
				/>
			</motion.div>

			<motion.div
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.3, duration: 0.3 }}
			>
				<label className="block text-sm font-medium mb-2 text-white">User Prompt</label>
				<Textarea
					value={userPrompt}
					onChange={(e) => setUserPrompt(e.target.value)}
					placeholder="輸入用戶提示詞..."
					className="min-h-24 bg-gray-900 border-gray-800 text-white resize-both focus:border-blue-500 focus:ring-blue-500 transition-colors overflow-y-auto"
					disabled={isReadOnly}
				/>
			</motion.div>
		</>
	)
}
