"use client"

import { useEffect, useState } from "react"
import { useAdvancedStore, type TestResult } from "@/lib/store/advanced"
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

export const AnalyticsTestsetSelectDialog = ({ }) => {
  const { testResults, ratingSelectedTestset, setRatingSelectedTestset } = useAdvancedStore()
  const { savedVersions } = usePromptStore()
  const [isOpen, setIsOpen] = useState(false)
  const [localSelected, setLocalSelected] = useState<string[]>([])

  useEffect(() => {
    const allIds = testResults.map(r => r.id)
    setLocalSelected(allIds)
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

  const handleSelectResult = (resultId: string) => {
    setLocalSelected(
      localSelected.includes(resultId)
        ? localSelected.filter(id => id !== resultId)
        : [...localSelected, resultId]
    )
  }

  const handleSelectAll = () => {
    setLocalSelected(testResults.map(r => r.id))
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
          <DialogTitle>選擇要比較的測試資料</DialogTitle>
          <DialogDescription>勾選以下表格中的測試資料以進行比較。最少選擇一項。</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 mb-2">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>全選</Button>
          <Button variant="outline" size="sm" onClick={handleClearAll}>取消全選</Button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>測試版本</TableHead>
                <TableHead>使用模型</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testResults.map(result => (
                <TableRow key={result.id}>
                  <TableCell>
                    <Checkbox
                      checked={localSelected.includes(result.id)}
                      onCheckedChange={() => handleSelectResult(result.id)}
                    />
                  </TableCell>
                  <TableCell>{getVersionName(result.versionId)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{result.modelId}</Badge>
                  </TableCell>
                </TableRow>
              ))}
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

