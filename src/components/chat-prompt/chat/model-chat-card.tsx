"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { ExternalLink, Maximize2 } from "lucide-react"
import { motion } from "framer-motion"
import { LoadingSpinner } from "./loading-spinner"
import { MessageBubble } from "./message-bubble"

interface Message {
	role: "user" | "assistant"
	content: string
	model?: string
	rating?: "good" | "bad" | null
	id?: string
}

interface ModelResponse {
	id: string
	name: string
	messages: Message[]
	isLoading: boolean
}

interface ModelChatCardProps {
	model: ModelResponse
	index: number
	scrollRef: (el: HTMLDivElement | null) => void
	syncScroll: boolean
	onPopupWindow: (modelId: string) => void
	onFullscreen: (modelId: string) => void
	chatHeight: number
	onSyncScroll: (sourceIndex: number, scrollTop: number, scrollHeight: number, clientHeight: number) => void
	onMessageRating: (messageId: string, rating: "good" | "bad") => void
}

export function ModelChatCard({
								  model,
								  index,
								  scrollRef,
								  syncScroll,
								  onPopupWindow,
								  onFullscreen,
								  chatHeight,
								  onSyncScroll,
								  onMessageRating,
							  }: ModelChatCardProps) {
	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		if (syncScroll) {
			const target = e.target as HTMLDivElement
			onSyncScroll(index, target.scrollTop, target.scrollHeight, target.clientHeight)
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.3, delay: index * 0.1 }}
			className="bg-gray-900 rounded-lg border border-gray-800 flex flex-col overflow-hidden"
			style={{ height: `${chatHeight}px` }}
		>
			{/* Header */}
			<div className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-800">
				<div className="flex items-center space-x-2">
					<div className="w-2 h-2 bg-green-500 rounded-full"></div>
					<span className="font-medium text-sm">{model.name}</span>
				</div>
				<div className="flex space-x-1">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" size="sm" onClick={() => onPopupWindow(model.id)} className="h-7 w-7 p-0">
									<ExternalLink className="h-3 w-3" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>在新視窗開啟</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" size="sm" onClick={() => onFullscreen(model.id)} className="h-7 w-7 p-0">
									<Maximize2 className="h-3 w-3" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>全螢幕檢視</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			{/* Messages Area */}
			<div className="flex-1 overflow-hidden">
				<div ref={scrollRef} className="h-full overflow-y-auto p-3 space-y-3 custom-scrollbar" onScroll={handleScroll}>
					{model.messages.map((message, msgIndex) => (
						<MessageBubble
							key={msgIndex}
							message={message}
							index={msgIndex}
							onRating={onMessageRating}
							showRating={message.role === "assistant"}
						/>
					))}
					{model.isLoading && (
						<div className="flex justify-start">
							<LoadingSpinner />
						</div>
					)}
				</div>
			</div>
		</motion.div>
	)
}
