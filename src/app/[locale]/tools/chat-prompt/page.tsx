"use client"

import { useState, useRef, useEffect } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"

// Layout Components
import { Header } from "@/components/chat-prompt/layout/header"

// Sidebar Components
import { VersionHistoryToggle } from "@/components/chat-prompt/sidebar/version-history-toggle"
import { VersionCard } from "@/components/chat-prompt/sidebar/version-card"
import { VersionCardCompare } from "@/components/chat-prompt/sidebar/version-card-compare"
import { VersionHistoryHeader } from "@/components/chat-prompt/sidebar/version-history-header"
import { ReadOnlyIndicator } from "@/components/chat-prompt/sidebar/read-only-indicator"
import { ModelSelectionDialog } from "@/components/chat-prompt/sidebar/model-selection-dialog"
import { ToolSelectionDialog } from "@/components/chat-prompt/sidebar/tool-selection-dialog"
import { PromptInputs } from "@/components/chat-prompt/sidebar/prompt-inputs"
import { ParametersSection } from "@/components/chat-prompt/sidebar/parameters-section"
import { SelectedItemsDisplay } from "@/components/chat-prompt/sidebar/selected-items-display"
import { RunTestButtons } from "@/components/chat-prompt/sidebar/run-test-buttons"

// Compare Components
import { VersionCompareSidebar } from "@/components/chat-prompt/compare/version-compare-sidebar"
import { VersionCompareView } from "@/components/chat-prompt/compare/version-compare-view"

// Chat Components
import { RightPanelControls } from "@/components/chat-prompt/chat/right-panel-controls"
import { ModelChatCard } from "@/components/chat-prompt/chat/model-chat-card"
import { UnifiedChatView } from "@/components/chat-prompt/chat/unified-chat-view"
import { PopupViewPlaceholder } from "@/components/chat-prompt/chat/popup-view-placeholder"
import { MessageInput } from "@/components/chat-prompt/chat/message-input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type ViewMode = "popup" | "unified" | "separate"

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

interface SavedVersion {
	id: string
	name: string
	savedAt: Date
	systemPrompt: string
	userPrompt: string
	temperature: number
	batchSize: string
	parameter2: string
	parameter3: string
	selectedModels: string[]
	selectedTools: string[]
	modelResponses: ModelResponse[]
	expanded?: boolean
}

const availableModels = [
	{ id: "gpt-4o", name: "gpt-4o", category: "OpenAI Models" },
	{ id: "gpt-4o-mini", name: "gpt-4o-mini", category: "OpenAI Models" },
	{ id: "gemini-2.0-flash", name: "gemini-2.0-flash", category: "Gemini Models" },
	{ id: "gemini-2.0-flash-lite", name: "gemini-2.0-flash-lite", category: "Gemini Models" },
	{ id: "gemini-2.0-pro-exp-02-05", name: "gemini-2.0-pro-exp-02-05", category: "Gemini Models" },
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
				// 處理 Date 對象的反序列化
				if (key === STORAGE_KEYS.SAVED_VERSIONS && Array.isArray(parsed)) {
					return parsed.map((version) => ({
						...version,
						savedAt: new Date(version.savedAt),
					}))
				}
				return parsed
			}
		}
	} catch (error) {
		console.error("Error loading from localStorage:", error)
	}
	return defaultValue
}

// 生成 XML 格式的 prompt 文件
const generatePromptXML = (systemPrompt: string, userPrompt: string, parameters: any) => {
	// 解析 System Prompt 中的各個部分
	const parseSystemPromptSections = (prompt: string) => {
		const sections = ["角色設定", "自我認知", "任務流程", "格式限制", "工具使用", "回覆限制與要求"]

		const parsedSections: { [key: string]: string } = {}

		sections.forEach((section) => {
			const regex = new RegExp(`<${section}>\\s*([\\s\\S]*?)(?=<|$)`, "g")
			const match = regex.exec(prompt)
			if (match && match[1]) {
				parsedSections[section] = match[1].trim()
			} else {
				parsedSections[section] = ""
			}
		})

		return parsedSections
	}

	const systemSections = parseSystemPromptSections(systemPrompt)

	const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<prompt>
  <system_prompt>
    <character>
      <![CDATA[${systemSections["角色設定"]}]]>
    </character>
    <self_awareness>
      <![CDATA[${systemSections["自我認知"]}]]>
    </self_awareness>
    <task_flow>
      <![CDATA[${systemSections["任務流程"]}]]>
    </task_flow>
    <format_constraints>
      <![CDATA[${systemSections["格式限制"]}]]>
    </format_constraints>
    <tools>
      <![CDATA[${systemSections["工具使用"]}]]>
    </tools>
    <response_requirements>
      <![CDATA[${systemSections["回覆限制與要求"]}]]>
    </response_requirements>
  </system_prompt>
  <user_prompt>
    <![CDATA[${userPrompt}]]>
  </user_prompt>
  <parameters>
    <temperature>${parameters.temperature}</temperature>
    <batch_size>${parameters.batchSize}</batch_size>
    <parameter2>${parameters.parameter2}</parameter2>
    <parameter3>${parameters.parameter3}</parameter3>
  </parameters>
  <models>
    ${parameters.selectedModels.map((model: string) => `<model>${model}</model>`).join("\n    ")}
  </models>
  <tools>
    ${parameters.selectedTools.map((tool: string) => `<tool>${tool}</tool>`).join("\n    ")}
  </tools>
  <timestamp>${new Date().toISOString()}</timestamp>
</prompt>`

	return xmlContent
}

// 下載 XML 文件
const downloadXMLFile = (content: string, filename: string) => {
	try {
		const blob = new Blob([content], { type: "application/xml;charset=utf-8" })
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = `${filename}.xml`
		a.style.display = "none"
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
		console.log(`XML file downloaded: ${filename}.xml`)
	} catch (error) {
		console.error("Error downloading XML file:", error)
	}
}

// 保存 XML 文件到 public/prompt-record 目錄
const saveXMLToPublic = (content: string, filename: string) => {
	try {
		// 創建一個隱藏的 a 標籤來觸發文件創建
		// 注意：瀏覽器環境中無法直接寫入 public 目錄
		// 這裡我們改為提示用戶手動保存到指定目錄
		console.log(`XML content for ${filename}:`, content)

		// 創建一個提示，告訴用戶將文件保存到 public/prompt-record 目錄
		const blob = new Blob([content], { type: "application/xml;charset=utf-8" })
		const url = URL.createObjectURL(blob)

		// 創建下載提示
		const notification = document.createElement("div")
		notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1f2937;
        color: white;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid #374151;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      ">
        <div style="font-weight: bold; margin-bottom: 8px;">XML 已生成</div>
        <div style="font-size: 14px; color: #9ca3af; margin-bottom: 12px;">
          請將文件保存到 public/prompt-record/ 目錄
        </div>
        <button onclick="
          const a = document.createElement('a');
          a.href = '${url}';
          a.download = '${filename}.xml';
          a.click();
          this.parentElement.remove();
        " style="
          background: #2563eb;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 8px;
        ">下載 XML</button>
        <button onclick="this.parentElement.remove()" style="
          background: #374151;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        ">關閉</button>
      </div>
    `
		document.body.appendChild(notification)

		// 5秒後自動移除通知
		setTimeout(() => {
			if (notification.parentElement) {
				notification.remove()
			}
			URL.revokeObjectURL(url)
		}, 5000)
	} catch (error) {
		console.error("Error saving XML file:", error)
	}
}

export default function AIPromptTester() {
	const [systemPrompt, setSystemPrompt] = useState(`<!角色設定>


<!自我認知>


<!任務流程>


<!格式限制>


<!工具使用>


<!回覆限制與要求>

`)
	const [userPrompt, setUserPrompt] = useState("")
	const [temperature, setTemperature] = useState([0.0])
	const [batchSize, setBatchSize] = useState("1")
	const [parameter2, setParameter2] = useState("option1")
	const [parameter3, setParameter3] = useState("option1")
	const [runTimes, setRunTimes] = useState(5)
	const [viewMode, setViewMode] = useState<ViewMode>("separate")
	const [selectedModels, setSelectedModels] = useState<string[]>(["gpt-4o", "gemini-2.0-flash"])
	const [selectedTools, setSelectedTools] = useState<string[]>(["sticker"])
	const [modelDialogOpen, setModelDialogOpen] = useState(false)
	const [toolDialogOpen, setToolDialogOpen] = useState(false)
	const [tempSelectedModels, setTempSelectedModels] = useState<string[]>(["gpt-4o", "gemini-2.0-flash"])
	const [tempSelectedTools, setTempSelectedTools] = useState<string[]>(["sticker"])

	// 添加追蹤是否有未保存變更的狀態
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
	const [originalVersionData, setOriginalVersionData] = useState<{
		modelResponses: ModelResponse[]
		systemPrompt: string
		userPrompt: string
		temperature: number
		batchSize: string
		parameter2: string
		parameter3: string
		selectedModels: string[]
		selectedTools: string[]
	} | null>(null)

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

	// 修改 showVersionHistory 的預設值為 false
	const [showVersionHistory, setShowVersionHistory] = useState(false)

	// 從 localStorage 載入保存的版本
	const [savedVersions, setSavedVersions] = useState<SavedVersion[]>(() => {
		return loadFromLocalStorage(STORAGE_KEYS.SAVED_VERSIONS, [])
	})

	const [saveDialogOpen, setSaveDialogOpen] = useState(false)
	const [saveVersionName, setSaveVersionName] = useState("")
	const [isReadOnly, setIsReadOnly] = useState(false)
	const [currentVersionId, setCurrentVersionId] = useState<string | null>(null)

	// 從 localStorage 載入 untitled counter
	const [untitledCounter, setUntitledCounter] = useState(() => {
		return loadFromLocalStorage(STORAGE_KEYS.UNTITLED_COUNTER, 1)
	})

	const scrollRefs = useRef<(HTMLDivElement | null)[]>([])

	// 從 localStorage 載入 UI 設定 - 修復 Hydration 錯誤
	const [chatHeight, setChatHeight] = useState(650) // 使用固定的默認值

	const messagesEndRef = useRef<HTMLDivElement>(null)

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

	// 下載 XML 函數
	const handleDownloadXML = () => {
		const xmlContent = generatePromptXML(systemPrompt, userPrompt, {
			temperature: temperature[0],
			batchSize,
			parameter2,
			parameter3,
			selectedModels,
			selectedTools,
		})

		const filename = getCurrentFileName()
		downloadXMLFile(xmlContent, filename)
	}

	// 組件載入時從 localStorage 恢復狀態
	useEffect(() => {
		const currentState = loadFromLocalStorage(STORAGE_KEYS.CURRENT_STATE, null)
		if (currentState) {
			setSystemPrompt(
				currentState.systemPrompt ||
				`<!角色設定>


<!自我認知>


<!任務流程>


<!格式限制>


<!工具使用>


<!回覆限制與要求>

`,
			)
			setUserPrompt(currentState.userPrompt || "")
			setTemperature(currentState.temperature || [0.0])
			setBatchSize(currentState.batchSize || "1")
			setParameter2(currentState.parameter2 || "option1")
			setParameter3(currentState.parameter3 || "option1")
			setSelectedModels(currentState.selectedModels || ["gpt-4o", "gemini-2.0-flash"])
			setSelectedTools(currentState.selectedTools || ["sticker"])
			setViewMode(currentState.viewMode || "separate")
			setSyncScroll(currentState.syncScroll || false)
			// 不從 localStorage 恢復 showVersionHistory，保持預設為 false
			// setShowVersionHistory(currentState.showVersionHistory || false)

			// 恢復對話內容
			if (currentState.modelResponses) {
				setModelResponses(currentState.modelResponses)
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
			userPrompt,
			temperature,
			batchSize,
			parameter2,
			parameter3,
			selectedModels,
			selectedTools,
			viewMode,
			syncScroll,
			showVersionHistory,
			modelResponses,
		}
		saveToLocalStorage(STORAGE_KEYS.CURRENT_STATE, currentState)
	}, [
		systemPrompt,
		userPrompt,
		temperature,
		batchSize,
		parameter2,
		parameter3,
		selectedModels,
		selectedTools,
		viewMode,
		syncScroll,
		showVersionHistory,
		modelResponses,
	])

	// 保存 UI 設定到 localStorage
	useEffect(() => {
		const uiSettings = {
			chatHeight,
			colorMode,
		}
		saveToLocalStorage(STORAGE_KEYS.UI_SETTINGS, uiSettings)
	}, [chatHeight, colorMode])

	// 計算每個對話框的高度
	const getIndividualChatHeight = () => {
		const modelCount = modelResponses.length
		if (modelCount <= 2) {
			return chatHeight
		} else if (modelCount <= 4) {
			// 4個模型時，每個高度為總高度的一半減去間距
			return Math.floor((chatHeight - 16) / 2) // 16px 是 gap-4 的間距
		} else {
			// 超過4個模型時，可以進一步調整
			return Math.floor((chatHeight - 32) / 3)
		}
	}

	// 獲取網格布局類名
	const getGridClassName = () => {
		const modelCount = modelResponses.length
		if (modelCount <= 2) {
			return "grid grid-cols-2 gap-4"
		} else if (modelCount <= 4) {
			return "grid grid-cols-2 grid-rows-2 gap-4"
		} else {
			return "grid grid-cols-2 gap-4 overflow-y-auto"
		}
	}

	// 同步滾動處理函數
	const handleSyncScroll = (sourceIndex: number, scrollTop: number, scrollHeight: number, clientHeight: number) => {
		if (!syncScroll) return

		// 計算滾動百分比
		const scrollPercentage = scrollTop / (scrollHeight - clientHeight)

		// 同步其他滾動容器
		scrollRefs.current.forEach((ref, index) => {
			if (ref && index !== sourceIndex) {
				const targetScrollHeight = ref.scrollHeight
				const targetClientHeight = ref.clientHeight
				const targetScrollTop = scrollPercentage * (targetScrollHeight - targetClientHeight)
				ref.scrollTop = targetScrollTop
			}
		})
	}

	// 當選擇的模型改變時，更新 modelResponses
	useEffect(() => {
		setModelResponses((prevResponses) => {
			const newResponses: ModelResponse[] = []

			selectedModels.forEach((modelId) => {
				const model = availableModels.find((m) => m.id === modelId)
				const existingResponse = prevResponses.find((r) => r.id === modelId)

				if (existingResponse) {
					// 保留現有的對話
					newResponses.push(existingResponse)
				} else {
					// 創建新的模型響應
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

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}

	useEffect(() => {
		scrollToBottom()
	}, [modelResponses])

	// 獲取當前文件名稱
	const getCurrentFileName = () => {
		if (currentVersionId) {
			const version = savedVersions.find((v) => v.id === currentVersionId)
			return version?.name || `Untitled_${untitledCounter}`
		}
		return `Untitled_${untitledCounter}`
	}

	const handleRunTest = async (times = 1) => {
		if (!userPrompt.trim()) {
			console.log("No user prompt provided")
			return
		}

		console.log("Starting Run Test...")

		// 生成 XML 文件到 public/prompt-record 目錄
		const xmlContent = generatePromptXML(systemPrompt, userPrompt, {
			temperature: temperature[0],
			batchSize,
			parameter2,
			parameter3,
			selectedModels,
			selectedTools,
		})

		const filename = getCurrentFileName()
		console.log("Generated XML content:", xmlContent)
		console.log("Saving XML to public/prompt-record/", filename)

		// 將 XML 保存到 public/prompt-record 目錄
		saveXMLToPublic(xmlContent, filename)

		setModelResponses((prev) =>
			prev.map((model) => ({
				...model,
				isLoading: true,
			})),
		)

		for (let i = 0; i < times; i++) {
			await Promise.all(
				modelResponses.map(async (model, index) => {
					const delay = 1000 + index * 500 + Math.random() * 1000

					setTimeout(() => {
						const mockResponse = `This is a mock response from ${model.name} (Run ${i + 1}/${times}).

System: ${systemPrompt || "No system prompt"}
User: ${userPrompt}
Temperature: ${temperature[0]}

This would be the actual AI response in a real implementation.`

						const messageId = `${Date.now()}-${Math.random()}`
						const responseId = `${Date.now()}-${Math.random()}-response`

						setModelResponses((prev) =>
							prev.map((m) =>
								m.id === model.id
									? {
										...m,
										messages: [
											...m.messages,
											{ role: "user", content: userPrompt, id: messageId },
											{ role: "assistant", content: mockResponse, model: model.name, id: responseId },
										],
										isLoading: i < times - 1,
									}
									: m,
							),
						)

						setTimeout(() => {
							scrollRefs.current.forEach((ref) => {
								if (ref) {
									ref.scrollTop = ref.scrollHeight
								}
							})
						}, 100)
					}, delay)
				}),
			)

			if (i < times - 1) {
				await new Promise((resolve) => setTimeout(resolve, 2000))
			}
		}

		setTimeout(() => {
			setModelResponses((prev) =>
				prev.map((model) => ({
					...model,
					isLoading: false,
				})),
			)
		}, 3000)
	}

	const handleSendMessage = async () => {
		if (!inputMessage.trim()) return

		const message = inputMessage
		setInputMessage("")

		setModelResponses((prev) =>
			prev.map((model) => {
				const messageId = `${Date.now()}-${Math.random()}`
				return {
					...model,
					messages: [...model.messages, { role: "user", content: message, id: messageId }],
					isLoading: true,
				}
			}),
		)

		setTimeout(() => {
			scrollRefs.current.forEach((ref) => {
				if (ref) {
					ref.scrollTop = ref.scrollHeight
				}
			})
		}, 100)

		await Promise.all(
			modelResponses.map(async (model, index) => {
				const delay = 1000 + index * 300 + Math.random() * 800

				setTimeout(() => {
					const mockResponse = `Response from ${model.name}: ${message}`
					const responseId = `${Date.now()}-${Math.random()}-response`

					setModelResponses((prev) =>
						prev.map((m) =>
							m.id === model.id
								? {
									...m,
									messages: [
										...m.messages,
										{ role: "assistant", content: mockResponse, model: model.name, id: responseId },
									],
									isLoading: false,
								}
								: m,
						),
					)

					setTimeout(() => {
						scrollRefs.current.forEach((ref) => {
							if (ref) {
								ref.scrollTop = ref.scrollHeight
							}
						})
					}, 100)
				}, delay)
			}),
		)
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
		setSystemPrompt(version.systemPrompt)
		setUserPrompt(version.userPrompt)
		setTemperature([version.temperature])
		setBatchSize(version.batchSize)
		setParameter2(version.parameter2)
		setParameter3(version.parameter3)
		setSelectedModels(version.selectedModels)
		setSelectedTools(version.selectedTools)
		// 恢復對話內容
		setModelResponses(version.modelResponses || [])

		// 保存原始數據用於比較
		setOriginalVersionData({
			modelResponses: version.modelResponses || [],
			systemPrompt: version.systemPrompt,
			userPrompt: version.userPrompt,
			temperature: version.temperature,
			batchSize: version.batchSize,
			parameter2: version.parameter2,
			parameter3: version.parameter3,
			selectedModels: version.selectedModels,
			selectedTools: version.selectedTools,
		})

		setIsReadOnly(true)
		setCurrentVersionId(version.id)
		setIsEditing(false)
		setShowVersionHistory(false)
		setHasUnsavedChanges(false)
	}

	const handleEditVersion = () => {
		setIsEditing(true)
	}

	const handleSaveEdit = () => {
		if (currentVersionId) {
			setSavedVersions((prev) =>
				prev.map((version) =>
					version.id === currentVersionId
						? {
							...version,
							systemPrompt,
							userPrompt,
							temperature: temperature[0],
							batchSize,
							parameter2,
							parameter3,
							selectedModels: [...selectedModels],
							selectedTools: [...selectedTools],
							modelResponses: [...modelResponses], // 保存當前對話
							savedAt: new Date(),
						}
						: version,
				),
			)
			setIsEditing(false)
			setShowVersionHistory(true)

			// 生成並下載更新的 XML 文件
			const xmlContent = generatePromptXML(systemPrompt, userPrompt, {
				temperature: temperature[0],
				batchSize,
				parameter2,
				parameter3,
				selectedModels,
				selectedTools,
			})

			const filename = getCurrentFileName()
			downloadXMLFile(xmlContent, filename)
		}
	}

	const handleSave = () => {
		const finalName = saveVersionName || `Untitled ${untitledCounter}`
		const newVersion: SavedVersion = {
			id: Date.now().toString(),
			name: finalName,
			savedAt: new Date(),
			systemPrompt,
			userPrompt,
			temperature: temperature[0],
			batchSize,
			parameter2,
			parameter3,
			selectedModels: [...selectedModels],
			selectedTools: [...selectedTools],
			modelResponses: [...modelResponses], // 保存當前對話內容
		}

		setSavedVersions((prev) => [newVersion, ...prev])
		if (!saveVersionName) {
			setUntitledCounter((prev) => prev + 1)
		}

		// 生成並下載 XML 文件
		const xmlContent = generatePromptXML(systemPrompt, userPrompt, {
			temperature: temperature[0],
			batchSize,
			parameter2,
			parameter3,
			selectedModels,
			selectedTools,
		})

		downloadXMLFile(xmlContent, finalName)

		setSaveVersionName("")
		setSaveDialogOpen(false)
		setShowVersionHistory(true)

		// 清空所有內容回到初始狀態
		setSystemPrompt(`<!角色設定>


<!自我認知>


<!任務流程>


<!格式限制>


<!工具使用>


<!回覆限制與要求>

`)
		setUserPrompt("")
		setTemperature([0.0])
		setBatchSize("1")
		setParameter2("option1")
		setParameter3("option1")
		setSelectedModels(["gpt-4o", "gemini-2.0-flash"])
		setSelectedTools(["sticker"])
		setModelResponses([
			{
				id: "gpt-4o",
				name: "gpt-4o",
				messages: [],
				isLoading: false,
			},
			{
				id: "gemini-2.0-flash",
				name: "gemini-2.0-flash",
				messages: [],
				isLoading: false,
			},
		])
		setInputMessage("")
		setHasUnsavedChanges(false)
		setOriginalVersionData(null)
	}

	const handleCopyVersion = (version: SavedVersion) => {
		setSystemPrompt(version.systemPrompt)
		setUserPrompt(version.userPrompt)
		setTemperature([version.temperature])
		setBatchSize(version.batchSize)
		setParameter2(version.parameter2)
		setParameter3(version.parameter3)
		setSelectedModels(version.selectedModels)
		setSelectedTools(version.selectedTools)
		// 不復制對話內容，讓用戶重新開始
		setModelResponses(
			version.selectedModels.map((modelId) => {
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
	}

	const handleDeleteVersion = (version: SavedVersion) => {
		console.log("Deleting version:", version.name)

		// 從保存的版本中刪除
		setSavedVersions((prev) => prev.filter((v) => v.id !== version.id))

		// 如果刪除的是當前載入的版本，退出版本檢視模式
		if (currentVersionId === version.id) {
			exitVersionMode()
		}

		// 如果在比較模式中，也要從比較列表中移除
		if (isInCompareView) {
			setCompareVersions((prev) => prev.filter((v) => v.id !== version.id))
			setInitialVersionOrder((prev) => prev.filter((v) => v.id !== version.id))
		}

		// 從比較選擇列表中移除
		setSelectedVersionsForCompare((prev) => prev.filter((id) => id !== version.id))

		console.log("Version deleted successfully")
	}

	const clearAll = () => {
		// 只清除當前顯示的對話和設定，不影響已保存的版本
		setModelResponses((prev) =>
			prev.map((model) => ({
				...model,
				messages: [],
			})),
		)
		setSystemPrompt(`<!角色設定>


<!自我認知>


<!任務流程>


<!格式限制>


<!工具使用>


<!回覆限制與要求>

`)
		setUserPrompt("")
		setTemperature([0.0])
		setBatchSize("1")
		setParameter2("option1")
		setParameter3("option1")
	}

	const exitVersionMode = () => {
		setIsReadOnly(false)
		setCurrentVersionId(null)
		setIsEditing(false)
		setHasUnsavedChanges(false)
		setOriginalVersionData(null)

		// 清空所有內容回到初始狀態
		setSystemPrompt(`<!角色設定>


<!自我認知>


<!任務流程>


<!格式限制>


<!工具使用>


<!回覆限制與要求>

`)
		setUserPrompt("")
		setTemperature([0.0])
		setBatchSize("1")
		setParameter2("option1")
		setParameter3("option1")
		setSelectedModels(["gpt-4o", "gemini-2.0-flash"])
		setSelectedTools(["sticker"])
		setModelResponses([
			{
				id: "gpt-4o",
				name: "gpt-4o",
				messages: [],
				isLoading: false,
			},
			{
				id: "gemini-2.0-flash",
				name: "gemini-2.0-flash",
				messages: [],
				isLoading: false,
			},
		])
		setInputMessage("")

		// 保持版本歷史面板開啟
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
		// 同時更新 savedVersions 中對應的版本
		setSavedVersions((prev) =>
			prev.map((version) => {
				const updatedVersion = updatedVersions.find((v) => v.id === version.id)
				return updatedVersion || version
			}),
		)
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
			// 如果對話框關閉且沒有保存，重置臨時選擇
			setTempSelectedModels([...selectedModels])
		}
	}

	const handleToolDialogChange = (open: boolean) => {
		setToolDialogOpen(open)
		if (!open) {
			// 如果對話框關閉且沒有保存，重置臨時選擇
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
      <title>${model.name} - OCR 測試系統</title>
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
        <div class="subtitle">OCR 測試系統 - 獨立視窗</div>
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

	const handleSaveToCurrentVersion = () => {
		if (currentVersionId) {
			setSavedVersions((prev) =>
				prev.map((version) =>
					version.id === currentVersionId
						? {
							...version,
							modelResponses: [...modelResponses], // 保存當前對話
							savedAt: new Date(),
						}
						: version,
				),
			)

			// 更新原始數據
			setOriginalVersionData({
				modelResponses: [...modelResponses],
				systemPrompt,
				userPrompt,
				temperature: temperature[0],
				batchSize,
				parameter2,
				parameter3,
				selectedModels: [...selectedModels],
				selectedTools: [...selectedTools],
			})

			setHasUnsavedChanges(false)
		}
	}

	// 檢查是否有未保存的變更
	useEffect(() => {
		if (currentVersionId && originalVersionData) {
			const hasChanges =
				JSON.stringify(modelResponses) !== JSON.stringify(originalVersionData.modelResponses) ||
				systemPrompt !== originalVersionData.systemPrompt ||
				userPrompt !== originalVersionData.userPrompt ||
				temperature[0] !== originalVersionData.temperature ||
				batchSize !== originalVersionData.batchSize ||
				parameter2 !== originalVersionData.parameter2 ||
				parameter3 !== originalVersionData.parameter3 ||
				JSON.stringify(selectedModels) !== JSON.stringify(originalVersionData.selectedModels) ||
				JSON.stringify(selectedTools) !== JSON.stringify(originalVersionData.selectedTools)

			setHasUnsavedChanges(hasChanges)
		}
	}, [
		modelResponses,
		systemPrompt,
		userPrompt,
		temperature,
		batchSize,
		parameter2,
		parameter3,
		selectedModels,
		selectedTools,
		currentVersionId,
		originalVersionData,
	])

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
						<>
							<VersionHistoryToggle
								showVersionHistory={showVersionHistory}
								onToggle={() => setShowVersionHistory(!showVersionHistory)}
							/>

							<AnimatePresence>
								{showVersionHistory && (
									<motion.div
										initial={{ width: 0, opacity: 0 }}
										animate={{ width: 320, opacity: 1 }}
										exit={{ width: 0, opacity: 0 }}
										transition={{ duration: 0.3, ease: "easeInOut" }}
										className="border-r border-gray-800 bg-black flex flex-col overflow-hidden"
									>
										<VersionHistoryHeader
											isCompareMode={isCompareMode}
											selectedVersions={selectedVersionsForCompare}
											onToggleCompareMode={handleToggleCompareMode}
											onConfirmCompare={handleConfirmCompare}
											onCancelCompare={handleCancelCompare}
											onSelectAll={handleSelectAll}
											totalVersions={savedVersions.length}
										/>
										<div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
											<AnimatePresence>
												{savedVersions.map((version, index) =>
													isCompareMode ? (
														<VersionCardCompare
															key={version.id}
															version={version}
															isSelected={selectedVersionsForCompare.includes(version.id)}
															onToggleSelect={handleToggleVersionSelect}
															onToggleExpanded={toggleVersionExpanded}
														/>
													) : (
														<VersionCard
															key={version.id}
															version={version}
															onLoadVersion={handleLoadVersion}
															onCopyVersion={handleCopyVersion}
															onDeleteVersion={handleDeleteVersion}
															onToggleExpanded={toggleVersionExpanded}
														/>
													),
												)}
											</AnimatePresence>
											{savedVersions.length === 0 && (
												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													className="text-center text-gray-400 py-8"
												>
													<p>尚無儲存的版本</p>
													<p className="text-xs mt-2 text-gray-500">建立第一個版本來開始使用</p>
												</motion.div>
											)}
										</div>
									</motion.div>
								)}
							</AnimatePresence>

							<motion.div
								initial={{ x: -20, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								transition={{ duration: 0.3, delay: 0.1 }}
								className="w-96 border-r border-gray-800 flex flex-col bg-black"
							>
								<div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
									<div className="space-y-8">
										<ReadOnlyIndicator
											isReadOnly={isReadOnly}
											isEditing={isEditing}
											currentVersionName={getCurrentVersionName()}
											onExitReadOnly={exitVersionMode}
											onEdit={handleEditVersion}
											onSaveEdit={handleSaveEdit}
										/>

										<AnimatePresence>
											{(!isReadOnly || isEditing) && (
												<motion.div
													initial={{ y: -20, opacity: 0 }}
													animate={{ y: 0, opacity: 1 }}
													exit={{ y: -20, opacity: 0 }}
													transition={{ duration: 0.3 }}
													className="flex space-x-3"
												>
													<ModelSelectionDialog
														open={modelDialogOpen}
														onOpenChange={handleModelDialogChange}
														selectedModels={tempSelectedModels}
														onToggleModel={handleModelToggle}
														onSave={handleModelSave}
														availableModels={availableModels}
														onClick={handleModelDialogOpen}
													/>
													<ToolSelectionDialog
														open={toolDialogOpen}
														onOpenChange={handleToolDialogChange}
														selectedTools={tempSelectedTools}
														onToggleTool={handleToolToggle}
														onSave={handleToolSave}
														availableTools={availableTools}
														onClick={handleToolDialogOpen}
													/>
												</motion.div>
											)}
										</AnimatePresence>

										<PromptInputs
											systemPrompt={systemPrompt}
											setSystemPrompt={setSystemPrompt}
											userPrompt={userPrompt}
											setUserPrompt={setUserPrompt}
											isReadOnly={isReadOnly && !isEditing}
											onDownloadXML={handleDownloadXML}
										/>

										<ParametersSection
											temperature={temperature}
											setTemperature={setTemperature}
											batchSize={batchSize}
											setBatchSize={setBatchSize}
											parameter2={parameter2}
											setParameter2={setParameter2}
											parameter3={parameter3}
											setParameter3={setParameter3}
											isReadOnly={isReadOnly && !isEditing}
										/>

										<SelectedItemsDisplay
											isReadOnly={isReadOnly && !isEditing}
											selectedModels={selectedModels}
											selectedTools={selectedTools}
											availableModels={availableModels}
											availableTools={availableTools}
										/>

										<RunTestButtons
											isReadOnly={isReadOnly && !isEditing}
											onRunTest={handleRunTest}
											runTimes={runTimes}
											setRunTimes={setRunTimes}
										/>
									</div>
								</div>
							</motion.div>
						</>
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
								onSaveToCurrentVersion={handleSaveToCurrentVersion}
								currentVersionId={currentVersionId}
								hasUnsavedChanges={hasUnsavedChanges}
							/>

							<div className="flex-1 p-4 overflow-hidden">
								{viewMode === "separate" && !fullscreenModel && (
									<div className="h-full relative">
										<div className={getGridClassName()} style={{ height: `${chatHeight}px` }}>
											{modelResponses.map((model, index) => (
												<ModelChatCard
													key={model.id}
													model={model}
													index={index}
													scrollRef={(el) => (scrollRefs.current[index] = el)}
													syncScroll={syncScroll}
													onPopupWindow={handlePopupWindow}
													onFullscreen={setFullscreenModel}
													chatHeight={getIndividualChatHeight()}
													onSyncScroll={handleSyncScroll}
													onMessageRating={handleMessageRating}
												/>
											))}
										</div>

										<div
											className="absolute"
											style={{
												top: `${chatHeight / 2}px`,
												left: "50%",
												transform: "translate(-50%, -50%)",
												zIndex: 10,
											}}
										>
											<Tooltip>
												<TooltipTrigger asChild>
													<motion.div
														whileHover={{ scale: 1.1 }}
														whileTap={{ scale: 0.9 }}
														animate={{ rotate: syncScroll ? 360 : 0 }}
														transition={{ duration: 0.3 }}
													>
														<Button
															variant={syncScroll ? "default" : "secondary"}
															size="sm"
															onClick={() => setSyncScroll(!syncScroll)}
															className={`w-12 h-12 rounded-full shadow-lg border-2 transition-all ${
																syncScroll
																	? "bg-blue-600 text-white border-blue-500 hover:bg-blue-700"
																	: "bg-gray-900 text-white border-gray-800 hover:bg-gray-800"
															}`}
														>
															<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
																/>
															</svg>
														</Button>
													</motion.div>
												</TooltipTrigger>
												<TooltipContent side="top" sideOffset={10} className="z-[9999]">
													<p>{syncScroll ? "關閉同步滾動" : "開啟同步滾動"}</p>
												</TooltipContent>
											</Tooltip>
										</div>
									</div>
								)}

								{viewMode === "unified" && (
									<UnifiedChatView
										modelResponses={modelResponses}
										messagesEndRef={messagesEndRef}
										chatHeight={chatHeight}
										onPopupWindow={() => {
											const conversationFlow: Array<{
												type: "user" | "assistant"
												content: string
												model?: string
											}> = []

											const maxLength = Math.max(...modelResponses.map((m) => m.messages.length))

											for (let i = 0; i < maxLength; i++) {
												const userMessage = modelResponses[0]?.messages[i]
												if (userMessage && userMessage.role === "user") {
													conversationFlow.push({
														type: "user",
														content: userMessage.content,
													})
												}

												modelResponses.forEach((model) => {
													const assistantMessage = model.messages[i]
													if (assistantMessage && assistantMessage.role === "assistant") {
														conversationFlow.push({
															type: "assistant",
															content: assistantMessage.content,
															model: model.name,
														})
													}
												})
											}

											const htmlContent = `
                      <!DOCTYPE html>
                      <html lang="zh-TW">
                      <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>統一對話框 - OCR 測試系統</title>
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
                          .title {
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
                          .model-label {
                            font-size: 12px;
                            color: #9CA3AF;
                            margin-bottom: 4px;
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
                          <div class="title">統一對話框</div>
                          <div class="subtitle">OCR 測試系統 - 獨立視窗</div>
                        </div>
                        <div class="messages">
                          ${
												conversationFlow.length === 0
													? '<div class="no-messages">尚無對話記錄</div>'
													: conversationFlow
														.map(
															(item) => `
                            <div class="message ${item.type === "user" ? "user-message" : "assistant-message"}">
                              ${item.type === "assistant" && item.model ? `<div class="model-label">${item.model}</div>` : ""}
                              <div class="message-content">${item.content}</div>
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
										}}
										onMessageRating={handleMessageRating}
									/>
								)}

								{viewMode === "popup" && (
									<PopupViewPlaceholder
										modelResponses={modelResponses}
										onPopupWindow={handlePopupWindow}
										onFullscreen={setFullscreenModel}
										setFullscreenModel={setFullscreenModel}
										handleMessageRating={handleMessageRating}
									/>
								)}

								{fullscreenModel && (
									<div className="absolute top-0 left-0 w-full h-full bg-black z-50 flex flex-col">
										<div className="p-4 flex justify-between items-center border-b border-gray-800">
											<div className="text-lg font-semibold">
												{modelResponses.find((m) => m.id === fullscreenModel)?.name || "Full Screen"}
											</div>
											<Button variant="secondary" size="sm" onClick={() => setFullscreenModel(null)}>
												關閉全螢幕
											</Button>
										</div>
										<div className="flex-1 p-4 overflow-y-auto">
											{/* 單個模型的全螢幕內容 */}
											{modelResponses
												.find((m) => m.id === fullscreenModel)
												?.messages.map((message, msgIndex) => (
													<motion.div
														key={msgIndex}
														initial={{ opacity: 0, x: message.role === "user" ? 20 : -20 }}
														animate={{ opacity: 1, x: 0 }}
														transition={{ delay: msgIndex * 0.05, duration: 0.3 }}
														className={`p-3 rounded-lg ${
															message.role === "user"
																? "bg-blue-600 text-white ml-8"
																: "bg-gray-800 text-white mr-8 border border-gray-700"
														}`}
													>
														<div className="text-sm whitespace-pre-wrap">{message.content}</div>
													</motion.div>
												))}
										</div>
									</div>
								)}
							</div>

							<motion.div
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.3, delay: 0.3 }}
								className="p-4 border-t border-gray-800"
							>
								<Card className="bg-gray-900 text-white">
									<MessageInput
										inputMessage={inputMessage}
										setInputMessage={setInputMessage}
										onSendMessage={handleSendMessage}
										isReadOnly={false}
									/>
								</Card>
							</motion.div>

							<div style={{ float: "left", clear: "both" }} ref={messagesEndRef} />
						</motion.div>
					)}
				</div>
			</div>
		</TooltipProvider>
	)
}
