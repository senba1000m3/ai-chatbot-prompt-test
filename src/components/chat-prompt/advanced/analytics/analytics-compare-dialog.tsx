"use client"

import { useState } from "react"
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

interface AnalyticsCompareDialogProps {
  onCompare: (selectedIds: string[]) => void
}

export const AnalyticsCompareDialog = ({ onCompare }: AnalyticsCompareDialogProps) => {
  const { testResults } = useAdvancedStore()
  const { savedVersions } = usePromptStore()
  const [selectedResultIds, setSelectedResultIds] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const getVersionName = (versionId: string) => {
    const version = savedVersions.find(v => v.id === versionId)
    return version ? version.name : "未知版本"
  }

  const handleSelectResult = (resultId: string) => {
    setSelectedResultIds(prev =>
      prev.includes(resultId)
        ? prev.filter(id => id !== resultId)
        : [...prev, resultId]
    )
  }

  const handleConfirm = () => {
    onCompare(selectedResultIds)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="pr-5 bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg">選擇比較項目</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>選擇要比較的測試結果</DialogTitle>
          <DialogDescription>勾選以下表格中的項目以進行比較。最少選擇一項。</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>測試時間</TableHead>
                <TableHead>測試版本</TableHead>
                <TableHead>使用模型</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testResults.map(result => (
                <TableRow key={result.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedResultIds.includes(result.id)}
                      onCheckedChange={() => handleSelectResult(result.id)}
                    />
                  </TableCell>
                  <TableCell>{new Date(result.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
					{getVersionName(result.versionId)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{result.modelId}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button onClick={handleConfirm} disabled={selectedResultIds.length === 0}>
            開始比較
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

