"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState, useMemo } from "react"
import { VersionHistoryToggle } from "./version-history-toggle"
import { VersionCard } from "./version-card"
import { VersionCardCompare } from "./version-card-compare"
import { VersionHistoryHeader } from "./version-history-header"
import { ReadOnlyIndicator } from "./read-only-indicator"
import { ModelSelectionDialog } from "./model-selection-dialog"
import { ToolSelectionDialog } from "./tool-selection-dialog"
import { ParametersSection } from "./parameters-section"
import { SelectedItemsDisplay } from "./selected-items-display"
import { CollapsibleSection } from "./collapsible-section"
import { SelectionSystemPrompt } from "./system-prompt-sections/selection-system-prompt"
import { DetailedSystemPrompt } from "./system-prompt-sections/detailed-system-prompt"
import { AdditionalSystemPrompt } from "./system-prompt-sections/additional-system-prompt"
import { DefaultHintMessage } from "./default-hint-message"
import { usePromptStore, type SavedVersion, type HintMessage, type SystemPromptData, type ModelAccuracy, availableModels } from "@/lib/store/prompt"

interface Message {
  role: "user" | "assistant"
  content: string
  model?: string
  rating?: "good" | "bad" | null
  id?: string
}

interface PromptOption {
  id: string;
  title: string;
  content: string;
  isDefault?: boolean;
}

interface SidebarContainerProps {
  onToggleVersionSelect: (versionId: string) => void
  getFilteredModelAccuracy: (version: SavedVersion) => ModelAccuracy[]
  isReadOnly: boolean
  isEditing: boolean
  currentVersionName: string
  onExitReadOnly: () => void
  onEdit: () => void
  onSaveEdit: () => void
  availableModels: Array<{ id: string; name: string; category: string }>
  availableTools: Array<{ id: string; name: string }>
  systemPromptOptions: {
    characterSettings: PromptOption[]
    usedTools: PromptOption[]
  }
  onSystemPromptOptionsChange: (type: "characterSettings" | "usedTools", options: PromptOption[]) => void
  defaultHintMessages: HintMessage[]
  setDefaultHintMessages: (messages: HintMessage[]) => void
  temperature: number[]
  setTemperature: (temp: number[]) => void
  batchSize: string
  setBatchSize: (size: string) => void
  parameter2: string
  setParameter2: (param: string) => void
  parameter3: string
  setParameter3: (param: string) => void
  selectedTools: string[]
  systemPromptEnabled: {
    characterSettings: boolean
    selfAwareness: boolean
    workflow: boolean
    formatLimits: boolean
    usedTools: boolean
    repliesLimits: boolean
    preventLeaks: boolean
  }
  onSystemPromptToggle: (type: string, enabled: boolean) => void
}

export function SidebarContainer({
  getFilteredModelAccuracy,
  availableModels,
  availableTools,
  systemPromptOptions,
  onSystemPromptOptionsChange,
  selectedTools,
}: SidebarContainerProps) {
  const {
	  selectedModels, setSelectedModels, savedVersions, toggleVersionExpanded, setSystemPrompt, systemPrompt, setIsSystemPromptOn, isSystemPromptOn, isCompareMode, showVersionHistory
  } = usePromptStore()

	const [isReadOnly, setIsReadOnly] = useState(false);
  	const [isEditing, setIsEditing] = useState(false);
	const defaultModels = ["gpt-4o", "gemini-2.0-flash"];
	const [tempSelectedModels, setTempSelectedModels] = useState<string[]>(selectedModels.length > 0 ? selectedModels : defaultModels);
	const [modelDialogOpen, setModelDialogOpen] = useState(false)
	const defaultTools = ["sticker"];
	const [tempSelectedTools, setTempSelectedTools] = useState<string[]>(selectedTools.length > 0 ? selectedTools : defaultTools);
	const [toolDialogOpen, setToolDialogOpen] = useState(false)

	useEffect(() => {
		setTempSelectedModels(selectedModels.length > 0 ? selectedModels : defaultModels);
	}, [selectedModels]);

	useEffect(() => {
	  setTempSelectedTools(selectedTools.length > 0 ? selectedTools : defaultTools);
	}, [selectedTools]);

	const handleToolDialogOpen = () => {
	  setTempSelectedTools([...selectedTools]);
	  setToolDialogOpen(true);
	};

	const handleToolDialogChange = (open: boolean) => {
	  setToolDialogOpen(open);
	  if (!open) {
		setTempSelectedTools([...selectedTools]);
	  }
	};

	const handleToolToggle = (toolId: string) => {
	  setTempSelectedTools((prev) =>
		prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
	  );
	};

	const handleToolSave = () => {
	  // setSelectedTools([...tempSelectedTools]);
	  setToolDialogOpen(false);
	};

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedModelFilters, setSelectedModelFilters] = useState<string[]>([]);
	const [selectedCharacterSettingsFilters, setSelectedCharacterSettingsFilters] = useState<string[]>([]);
	const [selectedToolsFilters, setSelectedToolsFilters] = useState<string[]>([]);
	const [sortBy, setSortBy] = useState("date-desc");

	const handleDownloadVersion = (version: SavedVersion) => {
		const versionToDownload: SavedVersion = {
		  id: version.id,
		  name: version.name,
		  expanded: version.expanded,
		  savedAt: version.savedAt,
		  modelAccuracy: version.modelAccuracy || [],
		  data: {
			systemPrompt: {
			  characterSettings: version.data.systemPrompt.characterSettings || "",
			  selfAwareness: version.data.systemPrompt.selfAwareness || "",
			  workflow: version.data.systemPrompt.workflow || "",
			  formatLimits: version.data.systemPrompt.formatLimits || "",
			  usedTools: version.data.systemPrompt.usedTools || "",
			  repliesLimits: version.data.systemPrompt.repliesLimits || "",
			  preventLeaks: version.data.systemPrompt.preventLeaks || "",
			},
			hintMessage: version.data.hintMessage || [],
			parameters: {
			  temperature: version.data.parameters.temperature ?? 0,
			  batchSize: version.data.parameters.batchSize || "",
			  parameter2: version.data.parameters.parameter2 || "",
			  parameter3: version.data.parameters.parameter3 || "",
			},
			models: version.data.models || [],
			tools: version.data.tools || [],
		  },
		};

		const jsonString = JSON.stringify(versionToDownload, null, 2);
		const blob = new Blob([jsonString], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${version.name}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

  const filteredAndSortedVersions = useMemo(() => {
    let result = savedVersions;
    // 搜尋
    if (searchQuery.trim() !== "") {
      result = result.filter(version => version.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    // 模型篩選
    if (selectedModelFilters.length > 0) {
      result = result.filter(version => version.data.models.some(model => selectedModelFilters.includes(model)));
    }
    // 角色設定篩選
    if (selectedCharacterSettingsFilters.length > 0) {
      result = result.filter(version => selectedCharacterSettingsFilters.includes(version.data.systemPrompt.characterSettings));
    }
    // 工具篩選
    if (selectedToolsFilters.length > 0) {
      result = result.filter(version => version.data.tools.some(tool => selectedToolsFilters.includes(tool)));
    }
    // 排序
    switch (sortBy) {
      case "name-asc":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result = [...result].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "date-desc":
        result = [...result].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
        break;
      case "date-asc":
        result = [...result].sort((a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime());
        break;
      case "accuracy-high":
        result = [...result].sort((a, b) => {
          const aAcc = a.modelAccuracy?.reduce((sum, m) => sum + m.accuracy, 0) ?? 0;
          const bAcc = b.modelAccuracy?.reduce((sum, m) => sum + m.accuracy, 0) ?? 0;
          return bAcc - aAcc;
        });
        break;
      case "accuracy-low":
        result = [...result].sort((a, b) => {
          const aAcc = a.modelAccuracy?.reduce((sum, m) => sum + m.accuracy, 0) ?? 0;
          const bAcc = b.modelAccuracy?.reduce((sum, m) => sum + m.accuracy, 0) ?? 0;
          return aAcc - bAcc;
        });
        break;
      default:
        result = [...result].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
        break;
    }
    return result;
  }, [savedVersions, searchQuery, selectedModelFilters, selectedCharacterSettingsFilters, selectedToolsFilters, sortBy])

	const handleModelDialogOpen = () => {
		setTempSelectedModels([...selectedModels])
		setModelDialogOpen(true)
	}

	const handleModelDialogChange = (open: boolean) => {
		setModelDialogOpen(open)
		if (!open) {
			setTempSelectedModels([...selectedModels])
		}
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

  // 在模型儲存時同步到 zustand
  const handleModelSave = () => {
	  setSelectedModels(tempSelectedModels)
	  setSelectedModels([...tempSelectedModels])
	  setModelDialogOpen(false)
  }

  // 處理 systemPrompt 的變更，直接使用 zustand 的 setSystemPrompt
  const handleSystemPromptChange = (key: string, value: string) => {
	setSystemPrompt(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  // 處理 systemPrompt 的開關，直接使用 zustand 的 setIsSystemPromptOn
  const handleSystemPromptToggle = (type: string, enabled: boolean) => {

    setIsSystemPromptOn(type, enabled);
  }

  // 自動生成 filterOptions
  const filterOptions = {
    models: availableModels.map(m => m.id),
    characterSettings: Array.from(new Set(savedVersions.map(v => v.data.systemPrompt.characterSettings).filter(Boolean))),
    tools: Array.from(new Set(savedVersions.flatMap(v => v.data.tools).filter(Boolean))),
  };

  return (
    <>
      <VersionHistoryToggle/>

      <AnimatePresence>
        {showVersionHistory && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-r border-gray-800 bg-black flex flex-col overflow-hidden h-screen"
          >
            <VersionHistoryHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedModels={selectedModelFilters}
              onModelFilterChange={setSelectedModelFilters}
              selectedCharacterSettings={selectedCharacterSettingsFilters}
              onCharacterSettingsFilterChange={setSelectedCharacterSettingsFilters}
              selectedTools={selectedToolsFilters}
              onToolsFilterChange={setSelectedToolsFilters}
              sortBy={sortBy}
              onSortChange={setSortBy}
              availableModels={filterOptions.models}
              availableCharacterSettings={filterOptions.characterSettings}
              availableTools={filterOptions.tools}
            />
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              <AnimatePresence>
                {filteredAndSortedVersions.map((version, index) =>
					isCompareMode ? (
                    <VersionCardCompare
                      key={version.id}
                      version={version}
                      onToggleExpanded={toggleVersionExpanded}
                    />
                  ) : (
					<VersionCard
						key={version.id}
						version={version}
						onDownloadVersion={handleDownloadVersion}
						filteredModelAccuracy={getFilteredModelAccuracy(version)}
						setIsReadOnly={setIsReadOnly}
					/>
                  ),
                )}
				  <div style={{marginBottom: "70px"}} />
              </AnimatePresence>
              {filteredAndSortedVersions.length === 0 && savedVersions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-400 py-8"
                >
                  <p>沒有符合條件的版本</p>
                  <p className="text-xs mt-2 text-gray-500">請調整搜尋或篩選條件</p>
                </motion.div>
              )}

              {savedVersions.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-400 py-8"
                >
                  <p>尚未儲存的版本</p>
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
        className="w-96 border-r border-gray-800 flex flex-col bg-black h-screen"
      >
        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
          <div className="space-y-8">
            <ReadOnlyIndicator
              isReadOnly={isReadOnly}
			  setIsReadOnly={setIsReadOnly}
              isEditing={isEditing}
			  setIsEditing={setIsEditing}
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

            <CollapsibleSection title="System Prompt" defaultOpen={true}>
              <div className="space-y-6">
                <SelectionSystemPrompt
                  title="角色設定"
                  value={systemPrompt.characterSettings}
                  onChange={(value) => handleSystemPromptChange("characterSettings", value)}
                  options={systemPromptOptions.characterSettings}
                  onOptionsChange={(options) => onSystemPromptOptionsChange("characterSettings", options)}
                  isReadOnly={isReadOnly && !isEditing}
                  isEnabled={isSystemPromptOn.characterSettings}
                  onToggleEnabled={(enabled) => handleSystemPromptToggle("characterSettings", enabled)}
                />

                <AdditionalSystemPrompt
                  title="自我認知"
                  value={systemPrompt.selfAwareness}
                  onChange={(value) => handleSystemPromptChange("selfAwareness", value)}
                  isReadOnly={isReadOnly && !isEditing}
                  isEnabled={isSystemPromptOn.selfAwareness}
                  onToggleEnabled={(enabled) => handleSystemPromptToggle("selfAwareness", enabled)}
                />

                <DetailedSystemPrompt
                  title="任務流程"
                  value={systemPrompt.workflow}
                  onChange={(value) => handleSystemPromptChange("workflow", value)}
                  isReadOnly={isReadOnly && !isEditing}
                  isEnabled={isSystemPromptOn.workflow}
                  onToggleEnabled={(enabled) => handleSystemPromptToggle("workflow", enabled)}
                />

                <DetailedSystemPrompt
                  title="格式限制"
                  value={systemPrompt.formatLimits}
                  onChange={(value) => handleSystemPromptChange("formatLimits", value)}
                  isReadOnly={isReadOnly && !isEditing}
                  isEnabled={isSystemPromptOn.formatLimits}
                  onToggleEnabled={(enabled) => handleSystemPromptToggle("formatLimits", enabled)}
                />

                <AdditionalSystemPrompt
                  title="工具使用"
                  value={systemPrompt.usedTools}
                  onChange={(value) => handleSystemPromptChange("usedTools", value)}
                  isReadOnly={isReadOnly && !isEditing}
                  isEnabled={isSystemPromptOn.usedTools}
                  onToggleEnabled={(enabled) => handleSystemPromptToggle("usedTools", enabled)}
                />

                <AdditionalSystemPrompt
                  title="回覆限制與要求"
                  value={systemPrompt.repliesLimits}
                  onChange={(value) => handleSystemPromptChange("repliesLimits", value)}
                  isReadOnly={isReadOnly && !isEditing}
                  isEnabled={isSystemPromptOn.repliesLimits}
                  onToggleEnabled={(enabled) => handleSystemPromptToggle("repliesLimits", enabled)}
                />

                <AdditionalSystemPrompt
                  title="防洩漏限制"
                  value={systemPrompt.preventLeaks}
                  onChange={(value) => handleSystemPromptChange("preventLeaks", value)}
                  isReadOnly={isReadOnly && !isEditing}
                  isEnabled={isSystemPromptOn.preventLeaks}
                  onToggleEnabled={(enabled) => handleSystemPromptToggle("preventLeaks", enabled)}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Default Hint Message" defaultOpen={true}>
              <DefaultHintMessage isReadOnly={isReadOnly}/>
            </CollapsibleSection>

            <CollapsibleSection title="Parameters" defaultOpen={true}>
              <ParametersSection
                isReadOnly={isReadOnly && !isEditing}
              />
            </CollapsibleSection>

            <SelectedItemsDisplay
              isReadOnly={isReadOnly && !isEditing}
              availableModels={availableModels}
              availableTools={availableTools}
            />
          </div>
        </div>
		<div style={{marginBottom: "65px"}} />
      </motion.div>
    </>
  )
}
