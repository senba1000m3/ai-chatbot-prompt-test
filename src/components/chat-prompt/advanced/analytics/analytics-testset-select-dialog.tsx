"use client"

import { useEffect, useState } from "react"
import { useAdvancedStore } from "@/lib/store/advanced"
import { usePromptStore } from "@/lib/store/prompt"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { mergeTestResults } from "./merge-test-results"

export const AnalyticsTestsetSelectDialog = ({ }) => {
  const { testResults, ratingSelectedTestset, setRatingSelectedTestset } = useAdvancedStore()
  const { savedVersions } = usePromptStore()
  const [isOpen, setIsOpen] = useState(false)
  const [localSelected, setLocalSelected] = useState<string[]>([])

  // 取得所有唯一的版本-模型組合及其數量
  const { mergedResults, countMap } = mergeTestResults(testResults);
  const versionModelPairs = mergedResults.map(result => ({
    versionId: result.versionId,
    modelId: result.modelId,
    count: countMap[`${result.versionId}|||${result.modelId}`]
  }))

  useEffect(() => {
    // 預設全選所有版本-模型組合
    setLocalSelected(versionModelPairs.map(pair => `${pair.versionId}|||${pair.modelId}`))
  }, [testResults])

  useEffect(() => {
    if (isOpen) {
      setLocalSelected(ratingSelectedTestset)
    }
  }, [isOpen])

  const getVersionName = (versionId: string) => {
    const version = savedVersions.find(v => v.id === versionId)
    return version ? version.name : "未知版本"
  }

  const handleSelectResult = (pairId: string) => {
    setLocalSelected(
      localSelected.includes(pairId)
        ? localSelected.filter(id => id !== pairId)
        : [...localSelected, pairId]
    )
  }

  const handleSelectAll = () => {
    setLocalSelected(versionModelPairs.map(pair => `${pair.versionId}|||${pair.modelId}`))
  }

  const handleClearAll = () => {
    setLocalSelected([])
  }

  const handleConfirm = () => {
    setRatingSelectedTestset(localSelected)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="pr-5 bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg">選擇測試資料</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>選擇要比較的版本-模型組合</DialogTitle>
          <DialogDescription>勾選以下表格中的版本-模型組合以進行比較。最少選擇一項。</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 mb-2">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>全選</Button>
          <Button variant="outline" size="sm" onClick={handleClearAll}>取消全選</Button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]" />
                <TableHead>測試版本</TableHead>
                <TableHead>使用模型</TableHead>
                <TableHead>次數</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versionModelPairs.map(pair => {
                const pairId = `${pair.versionId}|||${pair.modelId}`
                return (
                  <TableRow key={pairId}>
                    <TableCell>
                      <Checkbox
                        checked={localSelected.includes(pairId)}
                        onCheckedChange={() => handleSelectResult(pairId)}
                      />
                    </TableCell>
                    <TableCell>{getVersionName(pair.versionId)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{pair.modelId}</Badge>
                    </TableCell>
                    <TableCell className="pl-3">{pair.count}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button onClick={handleConfirm} disabled={localSelected.length === 0}>
            開始比較
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

