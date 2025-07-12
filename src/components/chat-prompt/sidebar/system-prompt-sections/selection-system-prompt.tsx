"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Plus, Edit2, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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

interface PromptOption {
  id: string
  title: string
  content: string
  isDefault?: boolean
}

interface SelectionSystemPromptProps {
  title: string
  value: string
  onChange: (value: string) => void
  options: PromptOption[]
  onOptionsChange: (options: PromptOption[]) => void
  isReadOnly?: boolean
  placeholder?: string
  isEnabled?: boolean
  onToggleEnabled?: (enabled: boolean) => void
}

export function SelectionSystemPrompt({
  title,
  value,
  onChange,
  options,
  onOptionsChange,
  isReadOnly = false,
  placeholder = "請選擇選項",
  isEnabled,
  onToggleEnabled,
}: SelectionSystemPromptProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newOptionTitle, setNewOptionTitle] = useState("")
  const [newOptionContent, setNewOptionContent] = useState("")
  const [editingOption, setEditingOption] = useState<PromptOption | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  // 根據當前值找到對應的選項
  const currentOption = options.find((option) => option.content === value)
  const displayTitle = currentOption?.title || "自訂內容"

  const handleSelectOption = (option: PromptOption) => {
    onChange(option.content) // 傳遞 content 而不是 id
    setIsOpen(false)
  }

  const handleAddOption = () => {
    if (newOptionTitle.trim() && newOptionContent.trim()) {
      const newOption: PromptOption = {
        id: Date.now().toString(),
        title: newOptionTitle.trim(),
        content: newOptionContent.trim(),
        isDefault: false,
      }
      onOptionsChange([...options, newOption])
      setNewOptionTitle("")
      setNewOptionContent("")
      setIsEditing(false)
    }
  }

  const handleEditOption = (option: PromptOption) => {
    setEditingOption(option)
    setEditTitle(option.title)
    setEditContent(option.content)
    setIsOpen(false)
  }

  const handleSaveEdit = () => {
    if (editingOption && editTitle.trim() && editContent.trim()) {
      const updatedOptions = options.map((option) =>
        option.id === editingOption.id ? { ...option, title: editTitle.trim(), content: editContent.trim() } : option,
      )
      onOptionsChange(updatedOptions)

      // 如果正在編輯的是當前選中的選項，更新當前值
      if (editingOption.content === value) {
        onChange(editContent.trim())
      }

      setEditingOption(null)
      setEditTitle("")
      setEditContent("")
    }
  }

  const handleDeleteOption = (optionToDelete: PromptOption) => {
    if (optionToDelete.isDefault) return // 不能刪除預設選項

    const updatedOptions = options.filter((option) => option.id !== optionToDelete.id)
    onOptionsChange(updatedOptions)

    // 如果刪除的是當前選中的選項，切換到第一個可用選項
    if (optionToDelete.content === value && updatedOptions.length > 0) {
      onChange(updatedOptions[0].content)
    }
  }

  const handleDirectEdit = (newValue: string) => {
    onChange(newValue)
  }

  if (isReadOnly) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs text-blue-400 border-blue-500">
            {displayTitle}
          </Badge>
        </div>
        <Textarea
          value={value}
          readOnly
          className="min-h-[80px] bg-gray-800 border-gray-700 text-gray-300 resize-none"
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h4 className="font-medium text-white text-base">{title}</h4>
          {onToggleEnabled && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onToggleEnabled(!isEnabled)}
              className={`w-8 h-4 rounded-full transition-colors duration-200 ${
                isEnabled ? "bg-blue-600" : "bg-gray-600"
              } relative`}
              disabled={isReadOnly}
            >
              <motion.div
                animate={{ x: isEnabled ? 16 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-4 h-4 bg-white rounded-full absolute top-0 left-0"
              />
            </motion.button>
          )}
        </div>
      </div>
      {/* 選項選擇器 */}
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
        >
          <span className="truncate">{displayTitle}</span>
          {isOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              {options.map((option) => (
                <div
                  key={option.id}
                  className={`group flex items-center justify-between px-3 py-2 hover:bg-gray-700 transition-colors ${
                    option.content === value ? "bg-blue-600" : ""
                  }`}
                >
                  <button onClick={() => handleSelectOption(option)} className="flex-1 text-left min-w-0">
                    <div className="font-medium text-sm text-white">{option.title}</div>
                    <div className="text-xs text-gray-400 mt-1 line-clamp-2">{option.content}</div>
                  </button>

                  {!option.isDefault && (
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-gray-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditOption(option)
                        }}
                      >
                        <Edit2 className="h-3 w-3 text-gray-400" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-gray-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-3 w-3 text-red-400" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-900 border-gray-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">刪除選項</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-300">
                              確定要刪除選項「{option.title}」嗎？此操作無法復原。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                              取消
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteOption(option)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              刪除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              ))}

              {/* 新增選項按鈕 */}
              <div className="border-t border-gray-700">
                <button
                  onClick={() => {
                    setIsEditing(true)
                    setIsOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-blue-400 hover:bg-gray-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新增選項
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 文字預覽 - 只顯示一行預覽 */}
      <div className="text-xs text-gray-400 bg-gray-800 p-2 rounded border border-gray-700 truncate">
        {value || `請輸入${title}...`}
      </div>

      {/* 新增選項對話框 */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-medium text-white mb-4">新增{title}選項</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">選項名稱</label>
                <Input
                  value={newOptionTitle}
                  onChange={(e) => setNewOptionTitle(e.target.value)}
                  placeholder="輸入選項名稱..."
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">選項內容</label>
                <Textarea
                  value={newOptionContent}
                  onChange={(e) => setNewOptionContent(e.target.value)}
                  placeholder="輸入選項內容..."
                  className="min-h-[100px] bg-gray-800 border-gray-700 text-white resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setNewOptionTitle("")
                  setNewOptionContent("")
                }}
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                取消
              </Button>
              <Button
                onClick={handleAddOption}
                disabled={!newOptionTitle.trim() || !newOptionContent.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                新增
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 編輯選項對話框 */}
      {editingOption && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-medium text-white mb-4">編輯{title}選項</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">選項名稱</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">選項內容</label>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[100px] bg-gray-800 border-gray-700 text-white resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingOption(null)
                  setEditTitle("")
                  setEditContent("")
                }}
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                取消
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={!editTitle.trim() || !editContent.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                儲存
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
