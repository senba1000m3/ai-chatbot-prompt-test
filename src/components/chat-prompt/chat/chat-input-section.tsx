"use client"

import { HintMessageButtons } from "./hint-message-buttons"
import { EnhancedMessageInput } from "./enhanced-message-input"

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
									 inputMessage,
									 setInputMessage,
									 onSendMessage,
									 multiSendTimes,
									 setMultiSendTimes,
									 inputDisabled,
								 }: ChatInputSectionProps) {
	return (
		<div className="border-t border-gray-800 bg-black">
			{/* 預設提示按鈕 */}
			<div className="p-4 pb-2">
				<HintMessageButtons messages={defaultHintMessages} onMessageClick={onHintMessageClick} show={showHintButtons} />
			</div>

			{/* 輸入框 */}
			<div className="p-4 pt-2">
				<EnhancedMessageInput
					inputMessage={inputMessage}
					setInputMessage={setInputMessage}
					onSendMessage={onSendMessage}
					multiSendTimes={multiSendTimes}
					setMultiSendTimes={setMultiSendTimes}
					disabled={inputDisabled}
				/>
			</div>
		</div>
	)
}