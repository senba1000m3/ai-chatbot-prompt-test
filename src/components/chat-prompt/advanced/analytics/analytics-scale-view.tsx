"use client"

import { usePromptStore } from "@/lib/store/prompt"
import { useAdvancedStore } from "@/lib/store/advanced"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { TestRatingsDistributionChart } from "./charts/test-ratings-distribution-chart"
import { TestResultsChart } from "./charts/test-results-chart"
import { TestRatingsTable } from "./charts/test-ratings-table"
import { TestRatingsLineChart } from "./charts/test-ratings-line-chart"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export const AnalyticsScaleView = () => {
  const { savedVersions } = usePromptStore()
  const { testResults, rubrics, historyRubrics, ratingCategories } = useAdvancedStore()

  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#ca82aa",
    "#a2ca82",
  ]

  const getVersionName = (versionId: string) => {
    const version = savedVersions.find(v => v.id === versionId)
    return version ? version.name : "未知版本"
  }

  const getRubricContent = (rubricId: string) => {
    const rubric = rubrics.find(r => r.rubric_id === rubricId)
    if (rubric) return rubric.content
    const historyRubric = (historyRubrics || []).find(r => r.rubric_id === rubricId)
    if (historyRubric) return `${historyRubric.content} (已棄用)`

    return "未知評分項"
  }

  const allRubricIds = (() => {
    const allAvailableRubrics = [...rubrics, ...(historyRubrics || [])]
    const allRubricIdsFromRatings = testResults.flatMap(result =>
        Object.values(result.ratings).flatMap(modelRatings =>
            Object.values(modelRatings).flatMap(rubricScores =>
                Object.keys(rubricScores)
            )
        )
    )
    const uniqueRubricIds = [...new Set(allRubricIdsFromRatings)]
    const rubricIdToCategoryId: Record<string, string> = {}
    uniqueRubricIds.forEach(rubricId => {
      const rubricInfo = allAvailableRubrics.find(r => r.rubric_id === rubricId)
      if (rubricInfo) {
        rubricIdToCategoryId[rubricId] = rubricInfo.category_id
      }
    })
    return uniqueRubricIds.sort((a, b) => {
      const categoryA = rubricIdToCategoryId[a]
      const categoryB = rubricIdToCategoryId[b]
      const indexA = ratingCategories.findIndex(c => c.category_id === categoryA)
      const indexB = ratingCategories.findIndex(c => c.category_id === categoryB)
      return indexA - indexB
    })
  })()

  const allCharts = [
    {
      title: "評分比較表格",
      description: "此表格顯示所有測試的各項評分分數。",
      content: <TestRatingsTable getVersionName={getVersionName} allRubricIds={allRubricIds} getRubricContent={getRubricContent} />,
    },
    {
      title: "評分分佈雷達圖",
      description: "此圖表顯示了不同測試中，各個評分項目的平均分數。",
      content: <TestRatingsDistributionChart colors={colors} getVersionName={getVersionName} allRubricIds={allRubricIds} getRubricContent={getRubricContent} />,
    },
    {
      title: "評分折線比較圖",
      description: "此折線圖比較所有測試在各評分項目的分數。",
      content: <TestRatingsLineChart colors={colors} getVersionName={getVersionName} allRubricIds={allRubricIds} getRubricContent={getRubricContent} />,
    },
    {
      title: "平均平方長條圖",
      description: "此長條圖顯示了不同測試的平均分數。",
      content: <TestResultsChart colors={colors} getVersionName={getVersionName} />,
    },
  ]

  const [showArr, setShowArr] = useState(() => new Array(allCharts.length).fill(true))
  const setShowChart = (idx: number) => setShowArr(arr => arr.map((v, i) => i === idx ? !v : v))

  return (
    <div className="p-4 md:p-6 space-y-5 overflow-y-auto h-[calc(100vh-130px)]">
      {allCharts.map((chart, idx) => (
        <Card key={idx}>
          <CardHeader className="flex flex-row item-center justify-between">
            <div className={`space-y-2 ${idx === 0 ? 'mb-3' : 'mb-5'}`}> {/* 根據原本的 mb 設定 */}
              <CardTitle>{chart.title}</CardTitle>
              <CardDescription>{chart.description}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowChart(idx)}>
                {showArr[idx] ? "摺疊" : "展開"}
              </Button>
            </div>
          </CardHeader>
          {showArr[idx] && (
            <CardContent>
              {testResults.length > 0 ? chart.content :
                  <div className="text-center text-gray-500 py-8">尚無任何測試結果可供圖表顯示</div>}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}

