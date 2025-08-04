"use client"

import { useState } from "react"
import { useAdvancedStore, type TestResult } from "@/lib/store/advanced"
import { usePromptStore } from "@/lib/store/prompt"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Eye, ChartNoAxesColumn, Trash2, Download } from "lucide-react"
import { TestResultDetailView } from "./test-result-detail-view"
import { TestResultRatingsView } from "./test-result-ratings-view"

export const AnalyticsOverview = () => {
  const { testResults, deleteTestResult, rubrics, historyRubrics } = useAdvancedStore()
  const { savedVersions } = usePromptStore()
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null)
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false)
  const [isRatingsViewOpen, setIsRatingsViewOpen] = useState(false)

  const handleViewDetails = (result: TestResult) => {
    setSelectedResult(result)
    setIsDetailViewOpen(true)
  }

  const handleViewRatings = (result: TestResult) => {
    setSelectedResult(result)
    setIsRatingsViewOpen(true)
  }

  const handleDeleteResult = (resultId: string) => {
    deleteTestResult(resultId)
  }

  const getVersionName = (versionId: string) => {
    const version = savedVersions.find(v => v.id === versionId)
    return version ? version.name : "未知版本"
  }

  const handleDownloadResult = (result: TestResult) => {
    const versionName = getVersionName(result.versionId)
    const allRubrics = [...rubrics, ...historyRubrics]
    const rubricIdToNameMap = allRubrics.reduce(
      (acc, rubric) => {
        if (!acc[rubric.rubric_id]) {
          acc[rubric.rubric_id] = rubric.content
        }
        return acc
      },
      {} as Record<string, string>
    )

    const originalRatings = result.ratings[result.versionId]?.[result.modelId]
    const transformedRatings = originalRatings
      ? Object.entries(originalRatings).reduce(
          (acc, [rubricId, score]) => {
            const rubricName = rubricIdToNameMap[rubricId] || "未知評分項"
            acc[rubricName] = score
            return acc
          },
          {} as Record<string, number>
        )
      : {}

    const downloadableResult = {
      id: result.id,
      timestamp: result.timestamp,
      versionName: versionName,
      modelId: result.modelId,
      messages: {
        [versionName]: result.messages[result.versionId],
      },
      ratings: {
        [versionName]: {
          [result.modelId]: transformedRatings,
        },
      },
    }

    const jsonString = JSON.stringify(downloadableResult, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `test-result-${result.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const calculateAverageScore = (ratings: any, versionId: string, modelId: string) => {
    const modelRatings = ratings[versionId]?.[modelId]
    if (!modelRatings) return "N/A"

    const scores = Object.values(modelRatings) as number[]
    if (scores.length === 0) return "N/A"

    const total = scores.reduce((acc, score) => acc + score, 0)
    const average = total / scores.length
    return average.toFixed(2)
  }

  return (
    <TooltipProvider>
      <div className="p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>測試結果總覽</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>測試時間</TableHead>
                  <TableHead>測試版本</TableHead>
                  <TableHead>使用模型</TableHead>
                  <TableHead className="text-left">平均分數</TableHead>
                  <TableHead className="text-left w-[250px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testResults.length > 0 ? (
                  testResults.map(result => (
                    <TableRow key={result.id}>
                      <TableCell>{new Date(result.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getVersionName(result.versionId)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{result.modelId}</Badge>
                      </TableCell>
                      <TableCell className="text-left font-medium pl-3">
                        {calculateAverageScore(result.ratings, result.versionId, result.modelId)}
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex space-x-1 -ml-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleViewDetails(result)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>查看對話紀錄</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleViewRatings(result)}>
                                <ChartNoAxesColumn className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>查看評分細項</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleDownloadResult(result)}>
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>下載 JSON</p>
                            </TooltipContent>
                          </Tooltip>
                          <AlertDialog>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>刪除此測試結果</p>
                              </TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>確定要刪除嗎？</AlertDialogTitle>
                                <AlertDialogDescription>
                                  此操作無法復原。這將永久刪除此筆測試結果。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogAction onClick={() => handleDeleteResult(result.id)}>刪除</AlertDialogAction>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                      尚無任何測試結果
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <TestResultDetailView
        result={selectedResult}
        isOpen={isDetailViewOpen}
        onClose={() => setIsDetailViewOpen(false)}
      />
      <TestResultRatingsView
        result={selectedResult}
        isOpen={isRatingsViewOpen}
        onClose={() => setIsRatingsViewOpen(false)}
      />
    </TooltipProvider>
  )
}

