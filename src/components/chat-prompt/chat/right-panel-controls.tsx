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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { ExternalLink, AlignJustify, Grid2X2, Palette, PaintBucket, Eye } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { usePromptStore } from "@/lib/store/prompt"
import { useState } from "react"

type ViewMode = "popup" | "unified" | "separate"

interface RightPanelControlsProps {
  saveDialogOpen: boolean
  setSaveDialogOpen: (open: boolean) => void
  saveVersionName: string
  setSaveVersionName: (name: string) => void
  untitledCounter: number
  onSaveConfirm: () => void
  onClearConfirm: () => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  chatHeight: number
  setChatHeight: (height: number) => void
  colorMode?: number
  onColorModeChange?: () => void
  isReadOnly?: boolean
}

export function RightPanelControls({
  viewMode,
  onViewModeChange,
  chatHeight,
  setChatHeight,
  colorMode = 0,
  onColorModeChange,
  isReadOnly = false,
}: RightPanelControlsProps) {
  const {
    clearModelMessages,
    systemPrompt,
    hintMessage,
    selectedModels,
    selectedTools,
	untitledCounter,
	addSavedVersion,
	savedVersions,
	parameters,
	isInCompareView
  } = usePromptStore()

  const [saveVersionName, setSaveVersionName] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const handleSaveConfirm = () => {
    const finalName = saveVersionName.trim() || `Untitled ${untitledCounter}`
    addSavedVersion({
      name: finalName,
      modelAccuracy: [],
      data: {
        systemPrompt,
		hintMessage,
		parameters,
        models: selectedModels,
        tools: selectedTools,
      },
    })

	setSaveDialogOpen(false);
	setSaveVersionName("");
  }

  const isNameDuplicate =
    saveVersionName.trim() !== "" && savedVersions.some((version) => version.name === saveVersionName.trim())

  const getColorModeIcon = () => {
    switch (colorMode) {
      case 1:
        return <Palette className="w-4 h-4" />
      case 2:
        return <PaintBucket className="w-4 h-4" />
      default:
        return <Eye className="w-4 h-4" />
    }
  }

  const getColorModeTooltip = () => {
    switch (colorMode) {
      case 1:
        return "邊框模式"
      case 2:
        return "背景模式"
      default:
        return "無顏色模式"
    }
  }

  const handleSaveDialogEscape = (event: KeyboardEvent) => {
    event.preventDefault()
    setSaveDialogOpen(false)
  }

  const handleSaveDialogOutside = (event: Event) => {
    event.preventDefault()
    setSaveDialogOpen(false)
  }

  const handleSizeDialogEscape = (event: KeyboardEvent) => {
    // 移除 event.preventDefault()，讓 Dialog 自然處理 ESC 鍵
  }

  const handleSizeDialogOutside = (event: Event) => {
    // 移除 event.preventDefault()，讓 Dialog 自然處理點擊外部
  }

  return (
    <TooltipProvider>
      <div className="p-4 border-b border-gray-800 flex justify-between items-center flex-shrink-0">
        <div className="flex space-x-2">
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-gray-900 transition-colors"
                  disabled={isReadOnly}
                >
                  Save
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent
              className="max-w-md bg-black border-gray-800"
              onEscapeKeyDown={handleSaveDialogEscape}
              onInteractOutside={handleSaveDialogOutside}
            >
              <DialogHeader>
                <DialogTitle className="text-white">儲存新版本</DialogTitle>
                <DialogDescription className="text-gray-300">請輸入新版本名稱，或留空使用預設名稱</DialogDescription>
              </DialogHeader>
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="py-4"
              >
                <Input
                  value={saveVersionName}
                  onChange={(e) => setSaveVersionName(e.target.value)}
                  placeholder={`Untitled ${untitledCounter}`}
                  className={`w-full bg-gray-900 border-gray-800 text-white focus:border-blue-500 focus:ring-blue-500 transition-colors ${
                    isNameDuplicate ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                {isNameDuplicate && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm mt-2"
                  >
                    此名稱已存在，請選擇其他名稱
                  </motion.p>
                )}
              </motion.div>
              <DialogFooter className="flex justify-center space-x-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="submit"
                    onClick={handleSaveConfirm}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isNameDuplicate}
                  >
                    確認
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={() => setSaveDialogOpen(false)}
                    className="text-gray-300 border-gray-800 hover:bg-gray-900"
                  >
                    取消
                  </Button>
                </motion.div>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-gray-900 transition-colors"
                >
                  Clear
                </Button>
              </motion.div>
            </AlertDialogTrigger>
            <AlertDialogContent
              className="bg-black border-gray-800"
              onEscapeKeyDown={(event) => {
                event.preventDefault()
                // AlertDialog 會自動處理 ESC 鍵
              }}
            >
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">清除對話</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-300">
                  確定要清除所有對話記錄嗎？此操作無法復原。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex justify-center space-x-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <AlertDialogAction onClick={clearModelMessages} className="bg-red-600 hover:bg-red-700">
                    確認
                  </AlertDialogAction>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <AlertDialogCancel className="text-gray-300 border-gray-800 hover:bg-gray-900">
                    取消
                  </AlertDialogCancel>
                </motion.div>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dialog>
            <DialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-gray-900 transition-colors"
                >
                  Size
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent
              className="max-w-md bg-black border-gray-800"
              onEscapeKeyDown={handleSizeDialogEscape}
              onInteractOutside={handleSizeDialogOutside}
            >
              <DialogHeader>
                <DialogTitle className="text-white">調整對話框高度</DialogTitle>
                <DialogDescription className="text-gray-300">拖動滑桿來調整右側對話框的高度</DialogDescription>
              </DialogHeader>
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="py-4"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-3 text-white">高度: {chatHeight}px</label>
                    <Slider
                      value={[chatHeight]}
                      onValueChange={(value) => setChatHeight(value[0])}
                      max={800}
                      min={300}
                      step={10}
                      className="w-full [&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-blue-500 [&_.bg-primary]:bg-blue-500"
                    />
                  </div>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>

          {isInCompareView && onColorModeChange && (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onColorModeChange}
                    className={`transition-colors ${
                      colorMode > 0
                        ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                        : "text-gray-300 hover:text-white hover:bg-gray-900"
                    }`}
                  >
                    {getColorModeIcon()}
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="z-[9999] bg-gray-800 border-gray-700 text-white">
                <p>{getColorModeTooltip()}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex space-x-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={viewMode === "popup" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange("popup")}
                  className={
                    viewMode === "popup"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-gray-300 hover:text-white hover:bg-gray-900"
                  }
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="z-[9999] bg-gray-800 border-gray-700 text-white">
              <p>彈出視窗</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={viewMode === "unified" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange("unified")}
                  className={
                    viewMode === "unified"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-gray-300 hover:text-white hover:bg-gray-900"
                  }
                >
                  <AlignJustify className="w-4 h-4" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="z-[9999] bg-gray-800 border-gray-700 text-white">
              <p>單一檢視</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={viewMode === "separate" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange("separate")}
                  className={
                    viewMode === "separate"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-gray-300 hover:text-white hover:bg-gray-900"
                  }
                >
                  <Grid2X2 className="w-4 h-4" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="z-[9999] bg-gray-800 border-gray-700 text-white">
              <p>方格檢視</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
