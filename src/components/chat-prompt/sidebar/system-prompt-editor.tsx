"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Edit3, Download } from "lucide-react"
import { useState, useEffect } from "react"

interface SystemPromptSection {
	title: string
	content: string
}

interface SystemPromptEditorProps {
	systemPrompt: string
	setSystemPrompt: (value: string) => void
	isReadOnly: boolean
	onDownloadXML?: () => void
}

const defaultSections: SystemPromptSection[] = [
	{ title: "角色設定", content: "" },
	{ title: "自我認知", content: "" },
	{ title: "任務流程", content: "" },
	{ title: "格式限制", content: "" },
	{ title: "工具使用", content: "" },
	{ title: "回覆限制與要求", content: "" },
]

export function SystemPromptEditor({
									   systemPrompt,
									   setSystemPrompt,
									   isReadOnly,
									   onDownloadXML,
								   }: SystemPromptEditorProps) {
	const [open, setOpen] = useState(false)
	const [sections, setSections] = useState<SystemPromptSection[]>(defaultSections)

	// 解析 systemPrompt 到 sections
	const parseSystemPrompt = (prompt: string): SystemPromptSection[] => {
		const parsed = [...defaultSections]

		defaultSections.forEach((section, index) => {
			const regex = new RegExp(`<${section.title}>\\s*([\\s\\S]*?)(?=<|$)`, "g")
			const match = regex.exec(prompt)
			if (match && match[1]) {
				parsed[index] = { ...section, content: match[1].trim() }
			}
		})

		return parsed
	}

	// 將 sections 組合成 systemPrompt
	const combineSections = (sectionList: SystemPromptSection[]): string => {
		return sectionList.map((section) => `<${section.title}>\n${section.content}`).join("\n\n")
	}

	// 初始化時解析現有的 systemPrompt
	useEffect(() => {
		if (systemPrompt) {
			setSections(parseSystemPrompt(systemPrompt))
		} else {
			// 如果沒有 systemPrompt，設置默認格式
			const defaultPrompt = combineSections(defaultSections)
			setSystemPrompt(defaultPrompt)
		}
	}, [])

	// 確保 systemPrompt 始終包含所有標題
	useEffect(() => {
		if (!systemPrompt || !defaultSections.every((section) => systemPrompt.includes(`<!${section.title}>`))) {
			const currentSections = systemPrompt ? parseSystemPrompt(systemPrompt) : defaultSections
			const updatedPrompt = combineSections(currentSections)
			setSystemPrompt(updatedPrompt)
		}
	}, [systemPrompt, setSystemPrompt])

	const handleSectionChange = (index: number, content: string) => {
		const newSections = [...sections]
		newSections[index] = { ...newSections[index], content }
		setSections(newSections)
	}

	const handleSave = () => {
		const newPrompt = combineSections(sections)
		setSystemPrompt(newPrompt)
		setOpen(false)
	}

	const handleOpen = () => {
		// 打開時重新解析當前的 systemPrompt
		setSections(parseSystemPrompt(systemPrompt))
		setOpen(true)
	}

	const handleEscapeKeyDown = (event: KeyboardEvent) => {
		event.preventDefault()
		setOpen(false)
	}

	const handleInteractOutside = (event: Event) => {
		event.preventDefault()
		setOpen(false)
	}

	const handleDownloadClick = () => {
		if (onDownloadXML) {
			onDownloadXML()
		}
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-2">
				<label className="block text-sm font-medium text-white">System Prompt</label>
				<div className="flex items-center space-x-2">
					{/* 下載 XML 按鈕 */}
					<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleDownloadClick}
							className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
							title="下載 XML"
						>
							<Download className="w-4 h-4" />
						</Button>
					</motion.div>

					{/* 編輯按鈕 */}
					<Dialog open={open} onOpenChange={setOpen}>
						<DialogTrigger asChild>
							<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleOpen}
									disabled={isReadOnly}
									className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
									title="編輯 System Prompt"
								>
									<Edit3 className="w-4 h-4" />
								</Button>
							</motion.div>
						</DialogTrigger>
						<DialogContent
							className="max-w-4xl max-h-[80vh] bg-black border-gray-800 overflow-hidden flex flex-col"
							onEscapeKeyDown={handleEscapeKeyDown}
							onInteractOutside={handleInteractOutside}
						>
							<DialogHeader>
								<DialogTitle className="text-white">編輯 System Prompt</DialogTitle>
								<DialogDescription className="text-gray-300">
									分別編輯各個部分的內容，系統會自動組合成完整的 System Prompt
								</DialogDescription>
							</DialogHeader>
							<div className="flex-1 overflow-y-auto py-4 space-y-4">
								{sections.map((section, index) => (
									<motion.div
										key={section.title}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.1, duration: 0.3 }}
									>
										<label className="block text-sm font-medium mb-2 text-white">{section.title}</label>
										<Textarea
											value={section.content}
											onChange={(e) => handleSectionChange(index, e.target.value)}
											placeholder={`輸入${section.title}相關內容...`}
											className="min-h-24 bg-gray-900 border-gray-800 text-white resize-y focus:border-blue-500 focus:ring-blue-500 transition-colors"
										/>
									</motion.div>
								))}
							</div>
							<DialogFooter className="flex justify-center space-x-4">
								<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
									<Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
										保存變更
									</Button>
								</motion.div>
								<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
									<Button
										variant="outline"
										onClick={() => setOpen(false)}
										className="text-gray-300 border-gray-800 hover:bg-gray-900"
									>
										取消
									</Button>
								</motion.div>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>
			<Textarea
				value={systemPrompt}
				onChange={(e) => setSystemPrompt(e.target.value)}
				placeholder="System Prompt 將自動格式化..."
				className="min-h-24 bg-gray-900 border-gray-800 text-white resize-both focus:border-blue-500 focus:ring-blue-500 transition-colors"
				disabled={isReadOnly}
				readOnly
			/>
		</div>
	)
}
