"use client"

import { AnimatePresence, motion } from "framer-motion"
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

interface Message {
  role: "user" | "assistant"
  content: string
  model?: string
  rating?: "good" | "bad" | null
  id?: string
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

interface SidebarContainerProps {
  showVersionHistory: boolean
  setShowVersionHistory: (show: boolean) => void
  isCompareMode: boolean
  selectedVersionsForCompare: string[]
  onToggleCompareMode: () => void
  onConfirmCompare: () => void
  onCancelCompare: () => void
  onSelectAll: () => void
  filteredAndSortedVersions: SavedVersion[]
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedModelFilters: string[]
  onModelFilterChange: (filters: string[]) => void
  selectedCharacterSettingsFilters: string[]
  onCharacterSettingsFilterChange: (filters: string[]) => void
  selectedToolsFilters: string[]
  onToolsFilterChange: (filters: string[]) => void
  sortBy: string
  onSortChange: (sort: string) => void
  filterOptions: {
    models: string[]
    characterSettings: string[]
    tools: string[]
  }
  onLoadVersion: (version: SavedVersion) => void
  onCopyVersion: (version: SavedVersion) => void
  onDeleteVersion: (version: SavedVersion) => void
  onDownloadVersion: (version: SavedVersion) => void
  onToggleExpanded: (versionId: string) => void
  onToggleVersionSelect: (versionId: string) => void
  getFilteredModelAccuracy: (version: SavedVersion) => ModelAccuracy[]
  savedVersions: SavedVersion[]
  isReadOnly: boolean
  isEditing: boolean
  currentVersionName: string
  onExitReadOnly: () => void
  onEdit: () => void
  onSaveEdit: () => void
  modelDialogOpen: boolean
  setModelDialogOpen: (open: boolean) => void
  toolDialogOpen: boolean
  setToolDialogOpen: (open: boolean) => void
  tempSelectedModels: string[]
  onModelToggle: (modelId: string) => void
  onModelSave: () => void
  tempSelectedTools: string[]
  onToolToggle: (toolId: string) => void
  onToolSave: () => void
  availableModels: Array<{ id: string; name: string; category: string }>
  availableTools: Array<{ id: string; name: string }>
  systemPrompt: SystemPromptData
  setSystemPrompt: (prompt: SystemPromptData) => void
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
  selectedModels: string[]
  selectedTools: string[]
  onModelDialogOpen: () => void
  onToolDialogOpen: () => void
  onModelDialogChange: (open: boolean) => void
  onToolDialogChange: (open: boolean) => void
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
  showVersionHistory,
  setShowVersionHistory,
  isCompareMode,
  selectedVersionsForCompare,
  onToggleCompareMode,
  onConfirmCompare,
  onCancelCompare,
  onSelectAll,
  filteredAndSortedVersions,
  searchQuery,
  onSearchChange,
  selectedModelFilters,
  onModelFilterChange,
  selectedCharacterSettingsFilters,
  onCharacterSettingsFilterChange,
  selectedToolsFilters,
  onToolsFilterChange,
  sortBy,
  onSortChange,
  filterOptions,
  onLoadVersion,
  onCopyVersion,
  onDeleteVersion,
  onDownloadVersion,
  onToggleExpanded,
  onToggleVersionSelect,
  getFilteredModelAccuracy,
  savedVersions,
  isReadOnly,
  isEditing,
  currentVersionName,
  onExitReadOnly,
  onEdit,
  onSaveEdit,
  modelDialogOpen,
  setModelDialogOpen,
  toolDialogOpen,
  setToolDialogOpen,
  tempSelectedModels,
  onModelToggle,
  onModelSave,
  tempSelectedTools,
  onToolToggle,
  onToolSave,
  availableModels,
  availableTools,
  systemPrompt,
  setSystemPrompt,
  systemPromptOptions,
  onSystemPromptOptionsChange,
  defaultHintMessages,
  setDefaultHintMessages,
  temperature,
  setTemperature,
  batchSize,
  setBatchSize,
  parameter2,
  setParameter2,
  parameter3,
  setParameter3,
  selectedModels,
  selectedTools,
  onModelDialogOpen,
  onToolDialogOpen,
  onModelDialogChange,
  onToolDialogChange,
  systemPromptEnabled,
  onSystemPromptToggle,
}: SidebarContainerProps) {
  return (
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
              onToggleCompareMode={onToggleCompareMode}
              onConfirmCompare={onConfirmCompare}
              onCancelCompare={onCancelCompare}
              onSelectAll={onSelectAll}
              totalVersions={filteredAndSortedVersions.length}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              selectedModels={selectedModelFilters}
              onModelFilterChange={onModelFilterChange}
              selectedCharacterSettings={selectedCharacterSettingsFilters}
              onCharacterSettingsFilterChange={onCharacterSettingsFilterChange}
              selectedTools={selectedToolsFilters}
              onToolsFilterChange={onToolsFilterChange}
              sortBy={sortBy}
              onSortChange={onSortChange}
              availableModels={filterOptions.models}
              availableCharacterSettings={filterOptions.characterSettings}
              availableTools={filterOptions.tools}
            />
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              <AnimatePresence>
                {filteredAndSortedVersions.map((version, index) =>
                  isCompareMode ? (
                    <VersionCardCompare
                      key={version.id}
                      version={version}
                      isSelected={selectedVersionsForCompare.includes(version.id)}
                      onToggleSelect={onToggleVersionSelect}
                      onToggleExpanded={onToggleExpanded}
                    />
                  ) : (
                    <VersionCard
                      key={version.id}
                      version={version}
                      onLoadVersion={onLoadVersion}
                      onCopyVersion={onCopyVersion}
                      onDeleteVersion={onDeleteVersion}
                      onDownloadVersion={onDownloadVersion}
                      onToggleExpanded={onToggleExpanded}
                      filteredModelAccuracy={getFilteredModelAccuracy(version)}
                    />
                  ),
                )}
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
              currentVersionName={currentVersionName}
              onExitReadOnly={onExitReadOnly}
              onEdit={onEdit}
              onSaveEdit={onSaveEdit}
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
                    onOpenChange={onModelDialogChange}
                    selectedModels={tempSelectedModels}
                    onToggleModel={onModelToggle}
                    onSave={onModelSave}
                    availableModels={availableModels}
                    onClick={onModelDialogOpen}
                  />
                  <ToolSelectionDialog
                    open={toolDialogOpen}
                    onOpenChange={onToolDialogChange}
                    selectedTools={tempSelectedTools}
                    onToggleTool={onToolToggle}
                    onSave={onToolSave}
                    availableTools={availableTools}
                    onClick={onToolDialogOpen}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <CollapsibleSection title="System Prompt" defaultOpen={true}>
              <div className="space-y-6">
                <SelectionSystemPrompt
                  title="角色設定"
                  value={systemPrompt.characterSettings}
                  onChange={(value) => setSystemPrompt((prev) => ({ ...prev, characterSettings: value }))}
                  options={systemPromptOptions.characterSettings}
                  onOptionsChange={(options) => onSystemPromptOptionsChange("characterSettings", options)}
                  isReadOnly={isReadOnly && !isEditing}
                  isEnabled={systemPromptEnabled.characterSettings}
                  onToggleEnabled={(enabled) => onSystemPromptToggle("characterSettings", enabled)}
                />

                <AdditionalSystemPrompt
                  title="自我認知"
                  value={systemPrompt.selfAwareness}
                  onChange={(value) => setSystemPrompt((prev) => ({ ...prev, selfAwareness: value }))}
                  isReadOnly={isReadOnly && !isEditing}
                  isEnabled={systemPromptEnabled.selfAwareness}
                  onToggleEnabled={(enabled) => onSystemPromptToggle("selfAwareness", enabled)}
                />

                <DetailedSystemPrompt
                  title="任務流程"
                  value={systemPrompt.workflow}
                  onChange={(value) => setSystemPrompt((prev) => ({ ...prev, workflow: value }))}
                  isReadOnly={isReadOnly && !isEditing}
                  isEnabled={systemPromptEnabled.workflow}
                  onToggleEnabled={(enabled) => onSystemPromptToggle("workflow", enabled)}
                />

                <DetailedSystemPrompt
                  title="格式限制"
                  value={systemPrompt.formatLimits}
                  onChange={(value) => setSystemPrompt((prev) => ({ ...prev, formatLimits: value }))}
                  isReadOnly={isReadOnly && !isEditing}
                  isEnabled={systemPromptEnabled.formatLimits}
                  onToggleEnabled={(enabled) => onSystemPromptToggle("formatLimits", enabled)}
                />

                <AdditionalSystemPrompt
                  title="工具使用"
                  value={systemPrompt.usedTools}
                  onChange={(value) => setSystemPrompt((prev) => ({ ...prev, usedTools: value }))}
                  isReadOnly={isReadOnly && !isEditing}
                  isEnabled={systemPromptEnabled.usedTools}
                  onToggleEnabled={(enabled) => onSystemPromptToggle("usedTools", enabled)}
                />

                <AdditionalSystemPrompt
                  title="回覆限制與要求"
                  value={systemPrompt.repliesLimits}
                  onChange={(value) => setSystemPrompt((prev) => ({ ...prev, repliesLimits: value }))}
                  isReadOnly={isReadOnly && !isEditing}
                  isEnabled={systemPromptEnabled.repliesLimits}
                  onToggleEnabled={(enabled) => onSystemPromptToggle("repliesLimits", enabled)}
                />

                <AdditionalSystemPrompt
                  title="防洩漏限制"
                  value={systemPrompt.preventLeaks}
                  onChange={(value) => setSystemPrompt((prev) => ({ ...prev, preventLeaks: value }))}
                  isReadOnly={isReadOnly && !isEditing}
                  isEnabled={systemPromptEnabled.preventLeaks}
                  onToggleEnabled={(enabled) => onSystemPromptToggle("preventLeaks", enabled)}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Default Hint Message" defaultOpen={true}>
              <DefaultHintMessage
                messages={defaultHintMessages}
                onChange={setDefaultHintMessages}
                isReadOnly={isReadOnly && !isEditing}
              />
            </CollapsibleSection>

            <CollapsibleSection title="Parameters" defaultOpen={true}>
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
            </CollapsibleSection>

            <SelectedItemsDisplay
              isReadOnly={isReadOnly && !isEditing}
              selectedModels={selectedModels}
              selectedTools={selectedTools}
              availableModels={availableModels}
              availableTools={availableTools}
            />
          </div>
        </div>
      </motion.div>
    </>
  )
}
