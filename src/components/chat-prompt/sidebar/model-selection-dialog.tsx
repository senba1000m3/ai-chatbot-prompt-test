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
import { Checkbox } from "@/components/ui/checkbox"
import { Settings } from "lucide-react"
import { useState } from "react"

interface Model {
  id: string
  name: string
  category: string
}

interface ModelSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedModels: string[]
  onToggleModel: (modelId: string) => void
  onSave: () => void
  availableModels: Model[]
  onClick?: () => void
}

export function ModelSelectionDialog({
  open,
  onOpenChange,
  selectedModels,
  onToggleModel,
  onSave,
  availableModels,
  onClick,
}: ModelSelectionDialogProps) {
  const [showThinkingModels, setShowThinkingModels] = useState(true)

  const getModelsByCategory = () => {
    const categories: { [key: string]: Model[] } = {}
    availableModels.forEach((model) => {
      if (!categories[model.category]) {
        categories[model.category] = []
      }
      categories[model.category].push(model)
    })
    return categories
  }

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
  }

  const handleEscapeKeyDown = (event: KeyboardEvent) => {
    event.preventDefault()
    onOpenChange(false)
  }

  const handleInteractOutside = (event: Event) => {
    event.preventDefault()
    onOpenChange(false)
  }

  const filteredModelsByCategory = Object.entries(getModelsByCategory()).map(([category, categoryModels]) => [
    category,
    categoryModels.filter((model) => showThinkingModels || !model.id.toLowerCase().includes('thinking')),
  ] as const)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="secondary"
            className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white"
            onClick={onClick}
          >
            <Settings className="w-4 h-4" />
            <span>Models ({selectedModels.length})</span>
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent
        className="max-w-md bg-black border-gray-800"
        onEscapeKeyDown={handleEscapeKeyDown}
        onInteractOutside={handleInteractOutside}
      >
        <DialogHeader>
          <DialogTitle className="text-white">Select Models</DialogTitle>
          <DialogDescription className="text-gray-300">Choose which models to use for testing.</DialogDescription>
        </DialogHeader>
        <div className="py-1 border-b border-gray-700 mb-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="flex items-center text-xs text-gray-400 hover:text-white focus:outline-none px-1 py-1 min-h-0 h-auto"
            onClick={() => setShowThinkingModels(v => !v)}
          >
            <span className="text-sm">顯示 Thinking 模型</span>
            <span className="ml-1 text-base select-none pointer-events-none" style={{zIndex:2}}>
              {showThinkingModels ? (
                <span className="text-green-500">✔</span>
              ) : (
                <span className="text-red-500">✗</span>
              )}
            </span>
          </Button>
        </div>
        {filteredModelsByCategory.map(([category, categoryModels]) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="font-medium mb-2 text-white">{category}</h4>
            <div className="space-y-2">
              {categoryModels.map((model, index) => (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={model.id}
                    checked={selectedModels.includes(model.id)}
                    onCheckedChange={() => onToggleModel(model.id)}
                  />
                  <label
                    htmlFor={model.id}
                    className={`text-sm ${
                      !selectedModels.includes(model.id) && selectedModels.length >= 4
                        ? "text-gray-500"
                        : "text-white"
                    }`}
                  >
                    {model.name}
                  </label>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
        <p className="text-xs text-gray-400">已選擇 {selectedModels.length}/4 個模型</p>
        <DialogFooter className="flex justify-center space-x-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-gray-300 border-gray-800 hover:bg-gray-900"
            >
              Cancel
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
