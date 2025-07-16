"use client"

import { useState, useEffect, useRef } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { motion } from "framer-motion"

// Layout Components
import { Header } from "@/components/chat-prompt/layout/header"

// Container Components
import { SidebarContainer } from "@/components/chat-prompt/sidebar/sidebar-container"
import { ChatViewContainer } from "@/components/chat-prompt/chat/chat-view-container"

// Compare Components
import { VersionCompareSidebar } from "@/components/chat-prompt/compare/version-compare-sidebar"
import { VersionCompareView } from "@/components/chat-prompt/compare/version-compare-view"

// Chat Components
import { RightPanelControls } from "@/components/chat-prompt/chat/right-panel-controls"

type ViewMode = "popup" | "unified" | "separate"

interface Message {
	role: "user" | "assistant"
	content: string
	model?: string
	rating?: "good" | "bad" | null
	id?: string
	responseTime?: number
}

interface ModelResponse {
	id: string
	name: string
	messages: Message[]
	isLoading: boolean
}

interface HintMessage {
	id: string
	content: string
}

interface PromptOption {
	id: string
	title: string
	content: string
	isDefault?: boolean
}

interface SystemPromptData {
	characterSettings: string
	selfAwareness: string
	workflow: string
	formatLimits: string
	usedTools: string
	repliesLimits: string
	preventLeaks: string
}

interface ModelAccuracy {
	model: string
	accuracy: number
}

interface SavedVersion {
	id: string
	name: string
	expanded: boolean
	savedAt: Date
	modelAccuracy: ModelAccuracy[]
	data: {
		systemPrompt: SystemPromptData
		userPrompt: HintMessage[]
		parameters: {
			temperature: number
			batchSize: string
			parameter2: string
			parameter3: string
		}
		models: string[]
		tools: string[]
	}
}

// 擴展的模型列表，包含所有可用模型
const availableModels = [
	{ id: "o4-mini", name: "o4-mini", category: "OpenAI Models" },
	{ id: "o3-mini", name: "o3-mini", category: "OpenAI Models" },
	{ id: "gpt-4.1", name: "GPT-4.1", category: "OpenAI Models" },
	{ id: "gpt-4.1-mini", name: "GPT-4.1 mini", category: "OpenAI Models" },
	{ id: "gpt-4.1-nano", name: "GPT-4.1 nano", category: "OpenAI Models" },
	{ id: "gpt-4o", name: "GPT-4o", category: "OpenAI Models" },
	{ id: "gpt-4o-mini", name: "GPT-4o mini", category: "OpenAI Models" },
	{ id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", category: "Google" },
	{ id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", category: "Google" },
	{ id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", category: "Google" },
	{ id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", category: "Google" },
]

const availableTools = [
	{ id: "sticker", name: "Sticker" },
	{ id: "plot", name: "Plot" },
]

// localStorage 相關常數
const STORAGE_KEYS = {
	SAVED_VERSIONS: "ai-prompt-tester-saved-versions",
	UNTITLED_COUNTER: "ai-prompt-tester-untitled-counter",
	CURRENT_STATE: "ai-prompt-tester-current-state",
	UI_SETTINGS: "ai-prompt-tester-ui-settings",
	SYSTEM_PROMPT_OPTIONS: "ai-prompt-tester-system-prompt-options",
	CHAT_MESSAGES: "ai-prompt-tester-chat-messages",
}

// Cookie 工具函數
const setCookie = (name: string, value: string, days = 1) => {
	try {
		const expires = new Date()
		expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
		document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
	} catch (error) {
		console.error("Error setting cookie:", error)
	}
}

const deleteCookie = (name: string) => {
	document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
}

const getCookie = (name: string): string | null => {
	try {
		const nameEQ = name + "="
		const ca = document.cookie.split(";")
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i]
			while (c.charAt(0) === " ") c = c.substring(1, c.length)
			if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
		}
		return null
	} catch (error) {
		console.error("Error getting cookie:", error)
		return null
	}
}

// localStorage 工具函數
const saveToLocalStorage = (key: string, data: any) => {
	try {
		if (typeof window !== "undefined") {
			localStorage.setItem(key, JSON.stringify(data))
		}
	} catch (error) {
		console.error("Error saving to localStorage:", error)
	}
}

const loadFromLocalStorage = (key: string, defaultValue: any = null) => {
	try {
		if (typeof window !== "undefined") {
			const item = localStorage.getItem(key)
			if (item) {
				const parsed = JSON.parse(item)
				if (key === STORAGE_KEYS.SAVED_VERSIONS && Array.isArray(parsed)) {
					return parsed.map((version) => ({
						...version,
						savedAt: new Date(version.savedAt),
						modelAccuracy: version.modelAccuracy || [],
					}))
				}
				return parsed
			}
		}
	} catch (error) {
		console.error(`Error loading from localStorage (${key}):`, error)
	}
	return defaultValue
}

// 計算模型準確率的函數
const calculateModelAccuracy = (modelResponse: ModelResponse): number => {
	const assistantMessages = modelResponse.messages.filter((msg) => msg.role === "assistant" && msg.rating)
	if (assistantMessages.length === 0) return Math.floor(Math.random() * 20) + 80

	const goodRatings = assistantMessages.filter((msg) => msg.rating === "good").length
	return Math.round((goodRatings / assistantMessages.length) * 100)
}

// 預設的系統提示選項
const getDefaultSystemPromptOptions = () => ({
	characterSettings: [
		{
			id: "default-character",
			title: "預設角色",
			content: "你是一個專業的AI助手，具備豐富的知識和經驗。",
			isDefault: true,
		},
	],
	usedTools: [
		{
			id: "default-tools",
			title: "基本工具",
			content: "可以使用基本的文字處理和分析工具。",
			isDefault: true,
		},
	],
})

export default function AIPromptTester() {
	// 系統提示相關狀態
	const [systemPromptOptions, setSystemPromptOptions] = useState(() =>
		loadFromLocalStorage(STORAGE_KEYS.SYSTEM_PROMPT_OPTIONS, getDefaultSystemPromptOptions()),
	)

	const [systemPrompt, setSystemPrompt] = useState<SystemPromptData>({
		characterSettings: systemPromptOptions.characterSettings[0]?.content || "",
		selfAwareness: "",
		workflow: "",
		formatLimits: "",
		usedTools: systemPromptOptions.usedTools[0]?.content || "",
		repliesLimits: "",
		preventLeaks: "",
	})

	// System Prompt 開關狀態
	const [systemPromptEnabled, setSystemPromptEnabled] = useState({
		characterSettings: true,
		selfAwareness: true,
		workflow: true,
		formatLimits: true,
		usedTools: true,
		repliesLimits: true,
		preventLeaks: true,
	})

	const [defaultHintMessages, setDefaultHintMessages] = useState<HintMessage[]>([
		{ id: "1", content: "請幫我分析這個問題" },
		{ id: "2", content: "能否提供更詳細的說明？" },
	])

	const [temperature, setTemperature] = useState([0.0])
	const [batchSize, setBatchSize] = useState("1")
	const [parameter2, setParameter2] = useState("option1")
	const [parameter3, setParameter3] = useState("option1")
	const [multiSendTimes, setMultiSendTimes] = useState(5)
	const [viewMode, setViewMode] = useState<ViewMode>("separate")
	const [selectedModels, setSelectedModels] = useState<string[]>(["gpt-4o", "gemini-2.0-flash"])
	const [selectedTools, setSelectedTools] = useState<string[]>(["sticker"])
	const [modelDialogOpen, setModelDialogOpen] = useState(false)
	const [toolDialogOpen, setToolDialogOpen] = useState(false)
	const [tempSelectedModels, setTempSelectedModels] = useState<string[]>(["gpt-4o", "gemini-2.0-flash"])
	const [tempSelectedTools, setTempSelectedTools] = useState<string[]>(["sticker"])

	// 根據選擇的模型動態生成 modelResponses
	const [modelResponses, setModelResponses] = useState<ModelResponse[]>(() => {
		return selectedModels.map((modelId) => {
			const model = availableModels.find((m) => m.id === modelId)
			return {
				id: modelId,
				name: model?.name || modelId,
				messages: [],
				isLoading: false,
			}
		})
	})

	const [inputMessage, setInputMessage] = useState("")
	const [fullscreenModel, setFullscreenModel] = useState<string | null>(null)
	const [syncScroll, setSyncScroll] = useState(false)
	const [showHintButtons, setShowHintButtons] = useState(true)
	const [inputDisabled, setInputDisabled] = useState(false)
	const [showVersionHistory, setShowVersionHistory] = useState(false)

	// 從 localStorage 載入保存的版本
	const [savedVersions, setSavedVersions] = useState<SavedVersion[]>(() => {
		return loadFromLocalStorage(STORAGE_KEYS.SAVED_VERSIONS, [])
	})

	// 添加篩選和排序相關狀態
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedModelFilters, setSelectedModelFilters] = useState<string[]>([])
	const [selectedCharacterSettingsFilters, setSelectedCharacterSettingsFilters] = useState<string[]>([])
	const [selectedToolsFilters, setSelectedToolsFilters] = useState<string[]>([])
	const [sortBy, setSortBy] = useState("newest")

	const [saveDialogOpen, setSaveDialogOpen] = useState(false)
	const [saveVersionName, setSaveVersionName] = useState("")
	const [isReadOnly, setIsReadOnly] = useState(false)
	const [currentVersionId, setCurrentVersionId] = useState<string | null>(null)

	// 從 localStorage 載入 untitled counter
	const [untitledCounter, setUntitledCounter] = useState(() => {
		return loadFromLocalStorage(STORAGE_KEYS.UNTITLED_COUNTER, 1)
	})

	const [chatHeight, setChatHeight] = useState(650)

	// 添加編輯狀態
	const [isEditing, setIsEditing] = useState(false)

	// 添加比較模式相關狀態
	const [isCompareMode, setIsCompareMode] = useState(false)
	const [selectedVersionsForCompare, setSelectedVersionsForCompare] = useState<string[]>([])
	const [isInCompareView, setIsInCompareView] = useState(false)
	const [compareVersions, setCompareVersions] = useState<SavedVersion[]>([])
	const [initialVersionOrder, setInitialVersionOrder] = useState<SavedVersion[]>([])

	// 添加顏色模式狀態
	const [colorMode, setColorMode] = useState(0)

	// 獲取所有可用的篩選選項
	const getAvailableFilterOptions = () => {
		const models = new Set<string>()
		const characterSettings = new Set<string>()
		const tools = new Set<string>()

		savedVersions.forEach((version) => {
			if (version.modelAccuracy && version.modelAccuracy.length > 0) {
				version.modelAccuracy.forEach((acc) => models.add(acc.model))
			}

			if (version.data && version.data.systemPrompt && version.data.systemPrompt.characterSettings) {
				characterSettings.add(version.data.systemPrompt.characterSettings)
			}

			if (version.data && version.data.tools && Array.isArray(version.data.tools)) {
				version.data.tools.forEach((tool) => tools.add(tool))
			}
		})

		return {
			models: Array.from(models),
			characterSettings: Array.from(characterSettings),
			tools: Array.from(tools),
		}
	}

	const filterOptions = getAvailableFilterOptions()

	// 保存系統提示選項到 localStorage
	useEffect(() => {
		saveToLocalStorage(STORAGE_KEYS.SYSTEM_PROMPT_OPTIONS, systemPromptOptions)
	}, [systemPromptOptions])

	// 組件載入時從 localStorage 恢復狀態
	useEffect(() => {
		const currentState = loadFromLocalStorage(STORAGE_KEYS.CURRENT_STATE, null)
		if (currentState) {
			if (currentState.systemPrompt) {
				setSystemPrompt(currentState.systemPrompt)
			}
			if (currentState.defaultHintMessages) {
				setDefaultHintMessages(currentState.defaultHintMessages)
			}
			setTemperature(currentState.temperature || [0.0])
			setBatchSize(currentState.batchSize || "1")
			setParameter2(currentState.parameter2 || "option1")
			setParameter3(currentState.parameter3 || "option1")
			setSelectedModels(currentState.selectedModels || ["gpt-4o", "gemini-2.0-flash"])
			setSelectedTools(currentState.selectedTools || ["sticker"])
			setViewMode(currentState.viewMode || "separate")
			setSyncScroll(currentState.syncScroll || false)
		}

		// 從 Cookie 恢復聊天記錄
		const savedChatMessages = getCookie(STORAGE_KEYS.CHAT_MESSAGES)
		if (savedChatMessages) {
			try {
				const parsedMessages = JSON.parse(savedChatMessages)
				if (Array.isArray(parsedMessages)) {
					setModelResponses(parsedMessages)
				} else {
					console.error("Invalid chat messages format in cookie:", parsedMessages)
					deleteCookie(STORAGE_KEYS.CHAT_MESSAGES)
				}
			} catch (error) {
				console.error("Error parsing chat messages from cookie:", error)
				deleteCookie(STORAGE_KEYS.CHAT_MESSAGES)
			}
		}
	}, [])

	// 組件掛載後從 localStorage 載入 UI 設定
	useEffect(() => {
		const uiSettings = loadFromLocalStorage(STORAGE_KEYS.UI_SETTINGS, {})
		if (uiSettings.chatHeight) {
			setChatHeight(uiSettings.chatHeight)
		}
		if (uiSettings.colorMode !== undefined) {
			setColorMode(uiSettings.colorMode)
		}
	}, [])

	// 保存版本到 localStorage
	useEffect(() => {
		saveToLocalStorage(STORAGE_KEYS.SAVED_VERSIONS, savedVersions)
	}, [savedVersions])

	// 保存 untitled counter 到 localStorage
	useEffect(() => {
		saveToLocalStorage(STORAGE_KEYS.UNTITLED_COUNTER, untitledCounter)
	}, [untitledCounter])

	// 保存當前狀態到 localStorage
	useEffect(() => {
		const currentState = {
			systemPrompt,
			defaultHintMessages,
			temperature,
			batchSize,
			parameter2,
			parameter3,
			selectedModels,
			selectedTools,
			viewMode,
			syncScroll,
			showVersionHistory,
		}
		saveToLocalStorage(STORAGE_KEYS.CURRENT_STATE, currentState)
	}, [
		systemPrompt,
		defaultHintMessages,
		temperature,
		batchSize,
		parameter2,
		parameter3,
		selectedModels,
		selectedTools,
		viewMode,
		syncScroll,
		showVersionHistory,
	])

	// 保存聊天記錄到 Cookie
	useEffect(() => {
		try {
			const jsonString = JSON.stringify(modelResponses)
			if (jsonString.length < 4000) {
				setCookie(STORAGE_KEYS.CHAT_MESSAGES, jsonString)
			} else {
				console.warn("Chat messages too large for cookie storage, not saving to cookie")
			}
		} catch (error) {
			console.error("Error saving chat messages to cookie:", error)
		}
	}, [modelResponses])

	// 保存 UI 設定到 localStorage
	useEffect(() => {
		const uiSettings = {
			chatHeight,
			colorMode,
		}
		saveToLocalStorage(STORAGE_KEYS.UI_SETTINGS, uiSettings)
	}, [chatHeight, colorMode])

	// 當選擇的模型改變時，更新 modelResponses
	useEffect(() => {
		setModelResponses((prevResponses) => {
			const newResponses: ModelResponse[] = []

			selectedModels.forEach((modelId) => {
				const model = availableModels.find((m) => m.id === modelId)
				const existingResponse = prevResponses.find((r) => r.id === modelId)

				if (existingResponse) {
					newResponses.push(existingResponse)
				} else {
					newResponses.push({
						id: modelId,
						name: model?.name || modelId,
						messages: [],
						isLoading: false,
					})
				}
			})

			return newResponses
		})
	}, [selectedModels])

	// 篩選和排序版本
	const getFilteredAndSortedVersions = () => {
		const filtered = savedVersions.filter((version) => {
			if (searchQuery && !version.name.toLowerCase().includes(searchQuery.toLowerCase())) {
				return false
			}

			if (selectedModelFilters.length > 0) {
				const hasMatchingModel = selectedModelFilters.some((model) =>
					version.modelAccuracy?.some((acc) => acc.model === model),
				)
				if (!hasMatchingModel) return false
			}

			if (selectedCharacterSettingsFilters.length > 0) {
				if (!selectedCharacterSettingsFilters.includes(version.data.systemPrompt.characterSettings)) {
					return false
				}
			}

			if (selectedToolsFilters.length > 0) {
				const hasMatchingTool = selectedToolsFilters.some((tool) => version.data.tools.includes(tool))
				if (!hasMatchingTool) return false
			}

			return true
		})

		filtered.sort((a, b) => {
			switch (sortBy) {
				case "newest":
					return b.savedAt.getTime() - a.savedAt.getTime()
				case "oldest":
					return a.savedAt.getTime() - b.savedAt.getTime()
				case "name-asc":
					return a.name.localeCompare(b.name)
				case "name-desc":
					return b.name.localeCompare(a.name)
				case "accuracy-high":
				case "accuracy-low": {
					const getVersionAccuracy = (version: SavedVersion) => {
						if (!version.modelAccuracy || version.modelAccuracy.length === 0) return 0

						if (selectedModelFilters.length > 0) {
							const filteredAccuracy = version.modelAccuracy.filter((acc) => selectedModelFilters.includes(acc.model))
							if (filteredAccuracy.length === 0) return 0
							return filteredAccuracy.reduce((sum, acc) => sum + acc.accuracy, 0) / filteredAccuracy.length
						}

						return version.modelAccuracy.reduce((sum, acc) => sum + acc.accuracy, 0) / version.modelAccuracy.length
					}

					const aAccuracy = getVersionAccuracy(a)
					const bAccuracy = getVersionAccuracy(b)

					return sortBy === "accuracy-high" ? bAccuracy - aAccuracy : aAccuracy - bAccuracy
				}
				default:
					return 0
			}
		})

		return filtered
	}

	const filteredAndSortedVersions = getFilteredAndSortedVersions()

	// 獲取篩選後的模型準確率
	const getFilteredModelAccuracy = (version: SavedVersion) => {
		if (selectedModelFilters.length === 0) {
			return version.modelAccuracy
		}

		return version.modelAccuracy?.filter((acc) => selectedModelFilters.includes(acc.model)) || []
	}

	const scrollRefs = useRef<(HTMLDivElement | null)[]>([])
	const messagesEndRef = useRef<HTMLDivElement>(null)

	// 發送消息的核心函數，支持自定義消息內容
	const sendMessageWithContent = async (messageContent: string, times = 1) => {
		if (!messageContent.trim()) return

		setShowHintButtons(false)

		// 如果是多次發送，立即禁用輸入
		if (times > 1) {
			setInputDisabled(true)
		}

		// 向所有模型發送消息
		setModelResponses((prev) =>
			prev.map((model) => {
				const messageId = `${Date.now()}-${Math.random()}`
				return {
					...model,
					messages: [...model.messages, { role: "user", content: messageContent, id: messageId }],
					isLoading: true,
				}
			}),
		)

		for (let i = 0; i < times; i++) {
			await Promise.all(
				modelResponses.map(async (model, index) => {
					const delay = 1000 + index * 300 + Math.random() * 800
					const startTime = Date.now()

					setTimeout(() => {
						const responseTime = Date.now() - startTime
						const mockResponse = `Response from ${model.name} (${i + 1}/${times}): ${messageContent}`
						const responseId = `${Date.now()}-${Math.random()}-response`

						setModelResponses((prev) =>
							prev.map((m) =>
								m.id === model.id
									? {
										...m,
										messages: [
											...m.messages,
											{
												role: "assistant",
												content: mockResponse,
												model: model.name,
												id: responseId,
												responseTime: responseTime,
											},
										],
										isLoading: i < times - 1,
									}
									: m,
							),
						)

						// 滾動到底部
						setTimeout(() => {
							scrollRefs.current.forEach((ref) => {
								if (ref) {
									ref.scrollTop = ref.scrollHeight
								}
							})
							if (messagesEndRef.current) {
								messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
							}
						}, 100)
					}, delay)
				}),
			)

			if (i < times - 1) {
				await new Promise((resolve) => setTimeout(resolve, 2000))
			}
		}

		// 只有在多次發送完成後才重新啟用，單次發送不需要等待
		if (times > 1) {
			setTimeout(() => {
				setModelResponses((prev) =>
					prev.map((model) => ({
						...model,
						isLoading: false,
					})),
				)
			}, 3000)
		} else {
			setTimeout(() => {
				setModelResponses((prev) =>
					prev.map((model) => ({
						...model,
						isLoading: false,
					})),
				)
			}, 3000)
		}
	}

	// 從輸入框發送消息
	const handleSendMessage = async (times = 1) => {
		if (!inputMessage.trim()) return

		const message = inputMessage
		setInputMessage("") // 清空輸入框

		await sendMessageWithContent(message, times)

		// 確保滾動到底部
		setTimeout(() => {
			scrollRefs.current.forEach((ref) => {
				if (ref) {
					ref.scrollTop = ref.scrollHeight
				}
			})
			if (messagesEndRef.current) {
				messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
			}
		}, 200)
	}

	// 點擊 hint message 直接發送
	const handleHintMessageClick = (content: string) => {
		sendMessageWithContent(content, 1)
	}

	const handleMessageRating = (messageId: string, rating: "good" | "bad") => {
		setModelResponses((prev) =>
			prev.map((model) => ({
				...model,
				messages: model.messages.map((msg) => (msg.id === messageId ? { ...msg, rating } : msg)),
			})),
		)
	}

	const handleLoadVersion = (version: SavedVersion) => {
		setSystemPrompt(version.data.systemPrompt)
		setDefaultHintMessages(version.data.userPrompt)
		setTemperature([version.data.parameters.temperature])
		setBatchSize(version.data.parameters.batchSize)
		setParameter2(version.data.parameters.parameter2)
		setParameter3(version.data.parameters.parameter3)
		setSelectedModels(version.data.models)
		setSelectedTools(version.data.tools)

		setModelResponses(
			version.data.models.map((modelId) => {
				const model = availableModels.find((m) => m.id === modelId)
				return {
					id: modelId,
					name: model?.name || modelId,
					messages: [],
					isLoading: false,
				}
			}),
		)

		setIsReadOnly(true)
		setCurrentVersionId(version.id)
		setIsEditing(false)
		setShowVersionHistory(false)
		setShowHintButtons(true)
		setInputDisabled(false)
	}

	const handleEditVersion = () => {
		setIsEditing(true)
	}

	const handleSaveEdit = () => {
		if (currentVersionId) {
			const currentModelAccuracy: ModelAccuracy[] = modelResponses.map((model) => ({
				model: model.id,
				accuracy: calculateModelAccuracy(model),
			}))

			setSavedVersions((prev) =>
				prev.map((version) =>
					version.id === currentVersionId
						? {
							...version,
							data: {
								systemPrompt: { ...systemPrompt },
								userPrompt: [...defaultHintMessages],
								parameters: {
									temperature: temperature[0],
									batchSize,
									parameter2,
									parameter3,
								},
								models: [...selectedModels],
								tools: [...selectedTools],
							},
							modelAccuracy: currentModelAccuracy,
							savedAt: new Date(),
						}
						: version,
				),
			)
			setIsEditing(false)
			setShowVersionHistory(true)
		}
	}

	const handleSave = () => {
		const finalName = saveVersionName || `Untitled ${untitledCounter}`

		const currentModelAccuracy: ModelAccuracy[] = modelResponses.map((model) => ({
			model: model.id,
			accuracy: calculateModelAccuracy(model),
		}))

		const newVersion: SavedVersion = {
			id: Date.now().toString(),
			name: finalName,
			expanded: false,
			savedAt: new Date(),
			modelAccuracy: currentModelAccuracy,
			data: {
				systemPrompt: { ...systemPrompt },
				userPrompt: [...defaultHintMessages],
				parameters: {
					temperature: temperature[0],
					batchSize,
					parameter2,
					parameter3,
				},
				models: [...selectedModels],
				tools: [...selectedTools],
			},
		}

		setSavedVersions((prev) => [newVersion, ...prev])
		if (!saveVersionName) {
			setUntitledCounter((prev) => prev + 1)
		}

		setSaveVersionName("")
		setSaveDialogOpen(false)
		setShowVersionHistory(true)

		// 清空所有內容回到初始狀態
		setSystemPrompt({
			characterSettings: systemPromptOptions.characterSettings[0]?.content || "",
			selfAwareness: "",
			workflow: "",
			formatLimits: "",
			usedTools: systemPromptOptions.usedTools[0]?.content || "",
			repliesLimits: "",
			preventLeaks: "",
		})
		setDefaultHintMessages([
			{ id: "1", content: "請幫我分析這個問題" },
			{ id: "2", content: "能否提供更詳細的說明？" },
		])
		setTemperature([0.0])
		setBatchSize("1")
		setParameter2("option1")
		setParameter3("option1")
		setSelectedModels(["gpt-4o", "gemini-2.0-flash"])
		setSelectedTools(["sticker"])
		setModelResponses([
			{
				id: "gpt-4o",
				name: "GPT-4o",
				messages: [],
				isLoading: false,
			},
			{
				id: "gemini-2.0-flash",
				name: "Gemini 2.0 Flash",
				messages: [],
				isLoading: false,
			},
		])
		setInputMessage("")
		setShowHintButtons(true)
		setInputDisabled(false)
	}

	const handleCopyVersion = (version: SavedVersion) => {
		setSystemPrompt(version.data.systemPrompt)
		setDefaultHintMessages(version.data.userPrompt)
		setTemperature([version.data.parameters.temperature])
		setBatchSize(version.data.parameters.batchSize)
		setParameter2(version.data.parameters.parameter2)
		setParameter3(version.data.parameters.parameter3)
		setSelectedModels(version.data.models)
		setSelectedTools(version.data.tools)

		setModelResponses(
			version.data.models.map((modelId) => {
				const model = availableModels.find((m) => m.id === modelId)
				return {
					id: modelId,
					name: model?.name || modelId,
					messages: [],
					isLoading: false,
				}
			}),
		)

		setIsReadOnly(false)
		setCurrentVersionId(null)
		setIsEditing(false)
		setShowVersionHistory(false)
		setShowHintButtons(true)
		setInputDisabled(false)
	}

	const handleDeleteVersion = (version: SavedVersion) => {
		console.log("Deleting version:", version.name)

		setSavedVersions((prev) => prev.filter((v) => v.id !== version.id))

		if (currentVersionId === version.id) {
			exitVersionMode()
		}

		if (isInCompareView) {
			setCompareVersions((prev) => prev.filter((v) => v.id !== version.id))
			setInitialVersionOrder((prev) => prev.filter((v) => v.id !== version.id))
		}

		setSelectedVersionsForCompare((prev) => prev.filter((id) => id !== version.id))

		console.log("Version deleted successfully")
	}

	const clearAll = () => {
		setModelResponses((prev) =>
			prev.map((model) => ({
				...model,
				messages: [],
			})),
		)
		setSystemPrompt({
			characterSettings: systemPromptOptions.characterSettings[0]?.content || "",
			selfAwareness: "",
			workflow: "",
			formatLimits: "",
			usedTools: systemPromptOptions.usedTools[0]?.content || "",
			repliesLimits: "",
			preventLeaks: "",
		})
		setDefaultHintMessages([
			{ id: "1", content: "請幫我分析這個問題" },
			{ id: "2", content: "能否提供更詳細的說明？" },
		])
		setTemperature([0.0])
		setBatchSize("1")
		setParameter2("option1")
		setParameter3("option1")
		setShowHintButtons(true)
		setInputDisabled(false) // 確保清除時重新啟用輸入
	}

	const exitVersionMode = () => {
		setIsReadOnly(false)
		setCurrentVersionId(null)
		setIsEditing(false)

		setSystemPrompt({
			characterSettings: systemPromptOptions.characterSettings[0]?.content || "",
			selfAwareness: "",
			workflow: "",
			formatLimits: "",
			usedTools: systemPromptOptions.usedTools[0]?.content || "",
			repliesLimits: "",
			preventLeaks: "",
		})
		setDefaultHintMessages([
			{ id: "1", content: "請幫我分析這個問題" },
			{ id: "2", content: "能否提供更詳細的說明？" },
		])
		setTemperature([0.0])
		setBatchSize("1")
		setParameter2("option1")
		setParameter3("option1")
		setSelectedModels(["gpt-4o", "gemini-2.0-flash"])
		setSelectedTools(["sticker"])
		setModelResponses([
			{
				id: "gpt-4o",
				name: "GPT-4o",
				messages: [],
				isLoading: false,
			},
			{
				id: "gemini-2.0-flash",
				name: "Gemini 2.0 Flash",
				messages: [],
				isLoading: false,
			},
		])
		setInputMessage("")
		setShowHintButtons(true)
		setInputDisabled(false)

		setShowVersionHistory(true)
	}

	const toggleVersionExpanded = (versionId: string) => {
		setSavedVersions((prev) => prev.map((v) => (v.id === versionId ? { ...v, expanded: !v.expanded } : v)))
	}

	const getCurrentVersionName = () => {
		if (currentVersionId) {
			const version = savedVersions.find((v) => v.id === currentVersionId)
			return version?.name || ""
		}
		return ""
	}

	// 比較模式相關函數
	const handleToggleCompareMode = () => {
		setIsCompareMode(!isCompareMode)
		setSelectedVersionsForCompare([])

		if (!isCompareMode) {
			setSavedVersions((prev) => prev.map((version) => ({ ...version, expanded: false })))
		}
	}

	const handleToggleVersionSelect = (versionId: string) => {
		setSelectedVersionsForCompare((prev) => {
			if (prev.includes(versionId)) {
				return prev.filter((id) => id !== versionId)
			} else {
				return [...prev, versionId]
			}
		})
	}

	const handleSelectAll = () => {
		const isAllSelected = selectedVersionsForCompare.length === savedVersions.length
		if (isAllSelected) {
			setSelectedVersionsForCompare([])
		} else {
			setSelectedVersionsForCompare(savedVersions.map((v) => v.id))
		}
	}

	const handleConfirmCompare = () => {
		const versionsToCompare = savedVersions.filter((v) => selectedVersionsForCompare.includes(v.id))
		setCompareVersions(versionsToCompare)
		setInitialVersionOrder([...versionsToCompare])
		setIsInCompareView(true)
		setShowVersionHistory(false)
	}

	const handleCancelCompare = () => {
		setIsCompareMode(false)
		setSelectedVersionsForCompare([])
	}

	const handleExitCompare = () => {
		setIsInCompareView(false)
		setIsCompareMode(false)
		setSelectedVersionsForCompare([])
		setCompareVersions([])
		setInitialVersionOrder([])
		setShowVersionHistory(true)
	}

	const handleVersionReorder = (newOrder: SavedVersion[]) => {
		setCompareVersions(newOrder)
	}

	const handleUpdateCompareVersions = (updatedVersions: SavedVersion[]) => {
		setCompareVersions(updatedVersions)

		setSavedVersions((prev) => {
			return prev.map((savedVersion) => {
				const updatedVersion = updatedVersions.find((uv) => uv.id === savedVersion.id)
				if (updatedVersion) {
					return {
						...savedVersion,
						modelAccuracy: updatedVersion.modelAccuracy || savedVersion.modelAccuracy,
					}
				}
				return savedVersion
			})
		})
	}

	const handleModelDialogOpen = () => {
		setTempSelectedModels([...selectedModels])
		setModelDialogOpen(true)
	}

	const handleToolDialogOpen = () => {
		setTempSelectedTools([...selectedTools])
		setToolDialogOpen(true)
	}

	const handleModelDialogChange = (open: boolean) => {
		setModelDialogOpen(open)
		if (!open) {
			setTempSelectedModels([...selectedModels])
		}
	}

	const handleToolDialogChange = (open: boolean) => {
		setToolDialogOpen(open)
		if (!open) {
			setTempSelectedTools([...selectedTools])
		}
	}

	const handleModelSave = () => {
		setSelectedModels([...tempSelectedModels])
		setModelDialogOpen(false)
	}

	const handleToolSave = () => {
		setSelectedTools([...tempSelectedTools])
		setToolDialogOpen(false)
	}

	const handleModelToggle = (modelId: string) => {
		setTempSelectedModels((prev) => {
			if (prev.includes(modelId)) {
				return prev.filter((id) => id !== modelId)
			} else if (prev.length < 4) {
				return [...prev, modelId]
			}
			return prev
		})
	}

	const handleToolToggle = (toolId: string) => {
		setTempSelectedTools((prev) => (prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]))
	}

	const handlePopupWindow = (modelId: string) => {
		const model = modelResponses.find((m) => m.id === modelId)
		if (!model) return

		const htmlContent = `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${model.name} - 聊天 Prompt 測試區</title>
      <style>
        body {
          margin: 0;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #000;
          color: #fff;
          line-height: 1.6;
        }
        .header {
          border-bottom: 1px solid #374151;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .model-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .subtitle {
          color: #9CA3AF;
          font-size: 14px;
        }
        .messages {
          max-width: 800px;
          margin: 0 auto;
        }
        .message {
          margin-bottom: 16px;
          padding: 12px 16px;
          border-radius: 8px;
          max-width: 80%;
        }
        .user-message {
          background: #2563EB;
          margin-left: auto;
          text-align: right;
        }
        .assistant-message {
          background: #374151;
          border: 1px solid #4B5563;
          margin-right: auto;
        }
        .message-content {
          white-space: pre-wrap;
          font-size: 14px;
        }
        .no-messages {
          text-align: center;
          color: #9CA3AF;
          padding: 40px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="model-name">${model.name}</div>
        <div class="subtitle">聊天 Prompt 測試區 - 獨立視窗</div>
      </div>
      <div class="messages">
        ${
			model.messages.length === 0
				? '<div class="no-messages">尚無對話記錄</div>'
				: model.messages
					.map(
						(message) => `
            <div class="message ${message.role === "user" ? "user-message" : "assistant-message"}">
              <div class="message-content">${message.content}</div>
            </div>
          `,
					)
					.join("")
		}
      </div>
    </body>
    </html>
  `

		const newWindow = window.open("", "_blank")
		if (newWindow) {
			newWindow.document.write(htmlContent)
			newWindow.document.close()
		}
	}

	const handleColorModeChange = () => {
		setColorMode((prev) => (prev + 1) % 3)
	}

	// 系統提示選項更新處理函數
	const handleSystemPromptOptionsChange = (type: "characterSettings" | "usedTools", options: PromptOption[]) => {
		setSystemPromptOptions((prev) => ({
			...prev,
			[type]: options,
		}))
	}

	// System Prompt 開關處理函數
	const handleSystemPromptToggle = (type: keyof typeof systemPromptEnabled, enabled: boolean) => {
		setSystemPromptEnabled((prev) => ({
			...prev,
			[type]: enabled,
		}))
	}

	// 同步滾動處理函數
	const handleSyncScroll = (sourceIndex: number, scrollTop: number, scrollHeight: number, clientHeight: number) => {
		// 這個函數會在 ChatViewContainer 中實現
	}

	return (
		<TooltipProvider>
			<div className="min-h-screen bg-black text-white flex flex-col">
				<Header />

				<div className="flex flex-1 overflow-hidden pt-[70px]">
					{/* 比較模式時顯示比較側邊欄 */}
					{isInCompareView ? (
						<VersionCompareSidebar
							compareVersions={compareVersions}
							availableModels={availableModels}
							availableTools={availableTools}
							onExitCompare={handleExitCompare}
							onVersionReorder={handleVersionReorder}
							colorMode={colorMode}
						/>
					) : (
						<SidebarContainer
							showVersionHistory={showVersionHistory}
							setShowVersionHistory={setShowVersionHistory}
							isCompareMode={isCompareMode}
							selectedVersionsForCompare={selectedVersionsForCompare}
							onToggleCompareMode={handleToggleCompareMode}
							onConfirmCompare={handleConfirmCompare}
							onCancelCompare={handleCancelCompare}
							onSelectAll={handleSelectAll}
							filteredAndSortedVersions={filteredAndSortedVersions}
							searchQuery={searchQuery}
							onSearchChange={setSearchQuery}
							selectedModelFilters={selectedModelFilters}
							onModelFilterChange={setSelectedModelFilters}
							selectedCharacterSettingsFilters={selectedCharacterSettingsFilters}
							onCharacterSettingsFilterChange={setSelectedCharacterSettingsFilters}
							selectedToolsFilters={selectedToolsFilters}
							onToolsFilterChange={setSelectedToolsFilters}
							sortBy={sortBy}
							onSortChange={setSortBy}
							filterOptions={filterOptions}
							onLoadVersion={handleLoadVersion}
							onCopyVersion={handleCopyVersion}
							onDeleteVersion={handleDeleteVersion}
							onToggleExpanded={toggleVersionExpanded}
							onToggleVersionSelect={handleToggleVersionSelect}
							getFilteredModelAccuracy={getFilteredModelAccuracy}
							savedVersions={savedVersions}
							isReadOnly={isReadOnly}
							isEditing={isEditing}
							currentVersionName={getCurrentVersionName()}
							onExitReadOnly={exitVersionMode}
							onEdit={handleEditVersion}
							onSaveEdit={handleSaveEdit}
							modelDialogOpen={modelDialogOpen}
							setModelDialogOpen={setModelDialogOpen}
							toolDialogOpen={toolDialogOpen}
							setToolDialogOpen={setToolDialogOpen}
							tempSelectedModels={tempSelectedModels}
							onModelToggle={handleModelToggle}
							onModelSave={handleModelSave}
							tempSelectedTools={tempSelectedTools}
							onToolToggle={handleToolToggle}
							onToolSave={handleToolSave}
							availableModels={availableModels}
							availableTools={availableTools}
							systemPrompt={systemPrompt}
							setSystemPrompt={setSystemPrompt}
							systemPromptOptions={systemPromptOptions}
							onSystemPromptOptionsChange={handleSystemPromptOptionsChange}
							defaultHintMessages={defaultHintMessages}
							setDefaultHintMessages={setDefaultHintMessages}
							temperature={temperature}
							setTemperature={setTemperature}
							batchSize={batchSize}
							setBatchSize={setBatchSize}
							parameter2={parameter2}
							setParameter2={setParameter2}
							parameter3={parameter3}
							setParameter3={setParameter3}
							selectedModels={selectedModels}
							selectedTools={selectedTools}
							onModelDialogOpen={handleModelDialogOpen}
							onToolDialogOpen={handleToolDialogOpen}
							onModelDialogChange={handleModelDialogChange}
							onToolDialogChange={handleToolDialogChange}
							systemPromptEnabled={systemPromptEnabled}
							onSystemPromptToggle={handleSystemPromptToggle}
						/>
					)}

					{/* 比較模式時顯示比較視圖，否則顯示正常的右側面板 */}
					{isInCompareView ? (
						<VersionCompareView
							compareVersions={compareVersions}
							chatHeight={chatHeight}
							colorMode={colorMode}
							onVersionReorder={handleVersionReorder}
							onColorModeChange={handleColorModeChange}
							initialVersionOrder={initialVersionOrder}
							onUpdateVersions={handleUpdateCompareVersions}
						/>
					) : (
						<motion.div
							initial={{ x: 20, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							transition={{ duration: 0.3, delay: 0.2 }}
							className="flex-1 flex flex-col bg-black"
						>
							<RightPanelControls
								saveDialogOpen={saveDialogOpen}
								setSaveDialogOpen={setSaveDialogOpen}
								saveVersionName={saveVersionName}
								setSaveVersionName={setSaveVersionName}
								untitledCounter={untitledCounter}
								onSaveConfirm={handleSave}
								onClearConfirm={clearAll}
								viewMode={viewMode}
								onViewModeChange={setViewMode}
								chatHeight={chatHeight}
								setChatHeight={setChatHeight}
								savedVersions={savedVersions}
								colorMode={colorMode}
								onColorModeChange={handleColorModeChange}
								isInCompareView={isInCompareView}
								isReadOnly={isReadOnly}
							/>

							<ChatViewContainer
								viewMode={viewMode}
								modelResponses={modelResponses}
								fullscreenModel={fullscreenModel}
								setFullscreenModel={setFullscreenModel}
								syncScroll={syncScroll}
								setSyncScroll={setSyncScroll}
								chatHeight={chatHeight}
								onPopupWindow={handlePopupWindow}
								onMessageRating={handleMessageRating}
								onSyncScroll={handleSyncScroll}
								defaultHintMessages={defaultHintMessages}
								onHintMessageClick={handleHintMessageClick}
								showHintButtons={showHintButtons}
								inputMessage={inputMessage}
								setInputMessage={setInputMessage}
								onSendMessage={handleSendMessage}
								multiSendTimes={multiSendTimes}
								setMultiSendTimes={setMultiSendTimes}
								inputDisabled={inputDisabled}
								scrollRefs={scrollRefs}
								messagesEndRef={messagesEndRef}
							/>
						</motion.div>
					)}
				</div>
			</div>
		</TooltipProvider>
	)
}


