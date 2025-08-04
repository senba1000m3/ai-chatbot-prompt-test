"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAdvancedStore, type TestResult } from "@/lib/store/advanced"
import { usePromptStore } from "@/lib/store/prompt"
import { Star } from "lucide-react"

interface TestResultRatingsViewProps {
  result: TestResult | null
  isOpen: boolean
  onClose: () => void
}

export const TestResultRatingsView = ({ result, isOpen, onClose }: TestResultRatingsViewProps) => {
  const { savedVersions } = usePromptStore()
  const { rubrics, historyRubrics, ratingCategories } = useAdvancedStore()

  if (!result) return null

  const getVersionName = (versionId: string) => {
    const version = savedVersions.find(v => v.id === versionId)
    return version ? version.name : "未知版本"
  }

  const getRubricDetails = (rubricId: string) => {
    let rubric = rubrics.find(r => r.rubric_id === rubricId)
    let isDeprecated = false

    if (!rubric) {
      rubric = (historyRubrics || []).find(r => r.rubric_id === rubricId)
      if (rubric) {
        isDeprecated = true
      }
    }

    if (!rubric)
      return { content: "未知評分項", category: "未知類別", category_id: "" }

    const category = ratingCategories.find(
      c => c.category_id === rubric!.category_id
    )
    return {
      content: isDeprecated ? `${rubric.content} (已棄用)` : rubric.content,
      category: category ? category.name : "未知類別",
      category_id: category ? category.category_id : "",
    }
  }

  const ratings = result.ratings[result.versionId]?.[result.modelId] || {}
  const ratingItems = Object.entries(ratings)
    .map(([rubricId, score]) => ({
      rubricId,
      score,
      ...getRubricDetails(rubricId),
    }))
    .sort((a, b) => {
      const categoryAIndex = ratingCategories.findIndex(c => c.category_id === a.category_id)
      const categoryBIndex = ratingCategories.findIndex(c => c.category_id === b.category_id)
      return categoryAIndex - categoryBIndex
    })

  const calculateAverageScore = () => {
    if (ratingItems.length === 0) return "N/A"
    const total = ratingItems.reduce((acc, item) => acc + item.score, 0)
    return (total / ratingItems.length).toFixed(2)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-4xl h-[70vh] flex flex-col bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>評分細項</DialogTitle>
          <DialogDescription asChild>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <span>版本:</span>
                <Badge variant="outline">{getVersionName(result.versionId)}</Badge>
                <span>模型:</span>
                <Badge variant="secondary">{result.modelId}</Badge>
              </div>
              <div className="text-lg font-bold text-yellow-400">
                平均分數: {calculateAverageScore()}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">類別</TableHead>
                <TableHead className="text-base">評分項</TableHead>
                <TableHead className="w-[100px] text-left text-base">分數</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ratingItems.length > 0 ? (
                ratingItems.map(item => (
                  <TableRow key={item.rubricId}>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className={item.content.includes("已棄用") ? "text-red-500" : ""}>{item.content}</TableCell>
                    <TableCell className="text-right pr-15">
                      <div className="flex items-center justify-end">
						  {item.score}
						  <Star className="w-4 h-4 ml-1 text-yellow-400 fill-yellow-400" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                    沒有評分紀錄
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">關閉</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

