"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../ui/dialog"
import { Button } from "../../../ui/button"
import { Checkbox } from "../../../ui/checkbox"
import { ScrollArea } from "../../../ui/scroll-area"
import { useAdvancedStore, type TestMessageSet } from "../../../../lib/store/advanced"

interface TestSetSelectDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function DatasetSelectDialog({ isOpen, onOpenChange }: TestSetSelectDialogProps) {
  const { testMessageDatasets, visibleTestSetIds, setVisibleTestSetIds } = useAdvancedStore()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(visibleTestSetIds))

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(visibleTestSetIds))
    }
  }, [isOpen, visibleTestSetIds])

  const handleSave = () => {
    setVisibleTestSetIds(Array.from(selectedIds))
    onOpenChange(false)
  }

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedIds(new Set(testMessageDatasets.map(d => d.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const isAllSelected = useMemo(() => {
    if (testMessageDatasets.length === 0) return false
    return testMessageDatasets.length > 0 && selectedIds.size === testMessageDatasets.length
  }, [selectedIds, testMessageDatasets])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>選擇要顯示的測試集</DialogTitle>
          <DialogDescription>
            勾選您想要在側邊欄中看到的測試集。
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-gray-700">
            <Checkbox
              id="select-all"
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              全選
            </label>
          </div>
          <ScrollArea className="h-60">
            <div className="space-y-3">
              {testMessageDatasets.map((dataset) => (
                <div key={dataset.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={dataset.id}
                    checked={selectedIds.has(dataset.id)}
                    onCheckedChange={(checked) => {
                      setSelectedIds((prev) => {
                        const newSet = new Set(prev)
                        if (checked) {
                          newSet.add(dataset.id)
                        } else {
                          newSet.delete(dataset.id)
                        }
                        return newSet
                      })
                    }}
                  />
                  <label
                    htmlFor={dataset.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {dataset.name}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSave}>儲存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

