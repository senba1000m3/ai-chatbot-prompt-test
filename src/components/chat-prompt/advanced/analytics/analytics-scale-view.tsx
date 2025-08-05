"use client"

import { usePromptStore, availableModels, availableTools } from "@/lib/store/prompt"
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
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AnalyticsTestsetSelectDialog } from "./analytics-testset-select-dialog"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"

export const AnalyticsScaleView = () => {
  const { savedVersions } = usePromptStore()
  const { testResults, rubrics, historyRubrics, ratingCategories, ratingSelectedTestset, setRatingSelectedTestset } = useAdvancedStore()

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

  const [filterModels, setFilterModels] = useState<string[]>([])
  const [filterCategories, setFilterCategories] = useState<string[]>([])
  const [sortKey, setSortKey] = useState<string>("timestamp")
  const [sortOrder, setSortOrder] = useState<"asc"|"desc">("desc")

  const filteredTestResults = testResults ? testResults.filter(result => {
    if (filterModels.length > 0 && !filterModels.includes(result.modelId)) return false
    if (ratingSelectedTestset.length > 0 && !ratingSelectedTestset.includes(result.id)) return false
    if (filterCategories.length > 0) {
      const allRubricIdsInResult = Object.values(result.ratings).flatMap(modelRatings =>
        Object.values(modelRatings).flatMap(rubricScores =>
          Object.keys(rubricScores)
        )
      )
      const rubricInCategory = allRubricIdsInResult.some(rubricId => {
        const rubric = rubrics.find(r => r.rubric_id === rubricId)
        return rubric && rubric.category_id && filterCategories.includes(rubric.category_id)
      })
      if (!rubricInCategory) return false
    }
    return true
  }) : []

  const sortedTestResults = [...filteredTestResults].sort((a, b) => {
    if (sortKey === "timestamp") {
      return sortOrder === "asc"
          ? a.timestamp - b.timestamp
          : b.timestamp - a.timestamp
    }
    if (sortKey === "modelId") {
      return sortOrder === "asc"
          ? a.modelId.localeCompare(b.modelId)
          : b.modelId.localeCompare(a.modelId)
    }
    if (sortKey === "versionId") {
      return sortOrder === "asc"
          ? a.versionId.localeCompare(b.versionId)
          : b.versionId.localeCompare(a.versionId)
    }
    return 0
  })

  const filteredRubricIds = (() => {
    const allAvailableRubrics = [...rubrics, ...(historyRubrics || [])]
    const allRubricIdsFromRatings = sortedTestResults.flatMap(result =>
      Object.values(result.ratings).flatMap(modelRatings =>
        Object.values(modelRatings).flatMap(rubricScores =>
          Object.keys(rubricScores)
        )
      )
    )
    let uniqueRubricIds = [...new Set(allRubricIdsFromRatings)]
    if (filterCategories.length > 0) {
      uniqueRubricIds = uniqueRubricIds.filter(rubricId => {
        const rubric = allAvailableRubrics.find(r => r.rubric_id === rubricId)
        return rubric && filterCategories.includes(rubric.category_id)
      })
    }
    return uniqueRubricIds
  })()

  const selectedBadges = [
    ...filterModels.map(modelId => ({ type: "model", value: modelId, label: availableModels.find(m => m.id === modelId)?.name || modelId })),
    ...filterCategories.map(catId => ({ type: "category", value: catId, label: ratingCategories.find(c => c.category_id === catId)?.name || catId })),
  ]

  const handleRemoveBadge = (type: string, value: string) => {
    if (type === "model") setFilterModels(models => models.filter(m => m !== value))
    if (type === "category") setFilterCategories(cats => cats.filter(c => c !== value))
  }
  const handleClearAllFilters = () => {
    setFilterModels([])
    setFilterCategories([])
  }

  const allCharts = [
    {
      title: "評分比較表格",
      description: "此表格顯示所有測試的各項評分分數。",
      content: <TestRatingsTable getVersionName={getVersionName} allRubricIds={filteredRubricIds} getRubricContent={getRubricContent} testResults={sortedTestResults} />,
    },
    {
      title: "評分分佈雷達圖",
      description: "此圖表顯示了不同測試中，各個評分項目的平均分數。",
      content: <TestRatingsDistributionChart colors={colors} getVersionName={getVersionName} allRubricIds={filteredRubricIds} getRubricContent={getRubricContent} testResults={sortedTestResults} />,
    },
    {
      title: "評分折線比較圖",
      description: "此折線圖比較所有測試在各評分項目的分數。",
      content: <TestRatingsLineChart colors={colors} getVersionName={getVersionName} allRubricIds={filteredRubricIds} getRubricContent={getRubricContent} testResults={sortedTestResults} />,
    },
    {
      title: "平均平方長條圖",
      description: "此長條圖顯示了不同測試的平均分數。",
      content: <TestResultsChart colors={colors} getVersionName={getVersionName} testResults={sortedTestResults} />,
    },
  ]

  const [showArr, setShowArr] = useState(() => new Array(allCharts.length).fill(true))
  const setShowChart = (idx: number) => setShowArr(arr => arr.map((v, i) => i === idx ? !v : v))

  return (
    <div className="p-4 md:p-6 space-y-5 overflow-y-auto h-[calc(100vh-130px)]">
      {/* 篩選區塊 */}
      <div className="flex flex-wrap gap-4 mb-2 items-end justify-between">
        <div className="flex gap-4 items-end">
          <div>
            <Label className="text-lg mb-3">測試資料</Label>
            <AnalyticsTestsetSelectDialog />
          </div>
          <div>
            <Label className="text-lg mb-3">模型</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-56 justify-start truncate">
                  {filterModels.length > 0
                    ? `${filterModels.length} 種已選擇`
                    : "全部"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 space-y-2 max-h-80 overflow-y-auto">
                {availableModels.map(model => {
                  const selected = filterModels.includes(model.id)
                  return (
                    <div key={model.id} className={`flex items-center gap-2 p-2 rounded cursor-pointer ${selected ? 'bg-gray-700' : ''}`}
                      onClick={() => {
                        setFilterModels(prev => selected
                          ? prev.filter(id => id !== model.id)
                          : [...prev, model.id]
                        )
                      }}
                    >
                      <span className="truncate w-full">{model.name}</span>
                    </div>
                  )
                })}
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label className="text-lg mb-3">量表分類</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-56 justify-start truncate">
                  {filterCategories.length > 0
                    ? `${filterCategories.length} 種已選擇`
                    : "全部"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 space-y-2 max-h-80 overflow-y-auto">
                {ratingCategories.map(cat => {
                  const selected = filterCategories.includes(cat.category_id)
                  return (
                    <div key={cat.category_id} className={`flex items-center gap-2 p-2 rounded cursor-pointer ${selected ? 'bg-gray-700' : ''}`}
                      onClick={() => {
                        setFilterCategories(prev => selected
                          ? prev.filter(id => id !== cat.category_id)
                          : [...prev, cat.category_id]
                        )
                      }}
                    >
                      <span className="truncate w-full">{cat.name}</span>
                    </div>
                  )
                })}
              </PopoverContent>
            </Popover>
          </div>
          {(filterModels.length > 0 || filterCategories.length > 0) && (
              <Button variant="outline" size="sm" onClick={handleClearAllFilters} className="h-10 px-5">清除所有篩選</Button>
          )}
        </div>
        <div className="flex gap-4 items-end">
          <div>
            <Label className="text-lg mb-3">排序</Label>
            <div className="h-10">
              <Select value={sortKey} onValueChange={setSortKey}>
                <SelectTrigger className="w-40 truncate">
                  {sortKey === "timestamp" && "測試時間"}
                  {sortKey === "modelId" && "模型"}
                  {sortKey === "versionId" && "版本"}
                </SelectTrigger>
                <SelectContent className="w-40">
                  <SelectItem value="timestamp">測試時間</SelectItem>
                  <SelectItem value="modelId">模型</SelectItem>
                  <SelectItem value="versionId">版本</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-lg mb-3">排序方式</Label>
            <div className="h-10">
              <Select value={sortOrder} onValueChange={v => setSortOrder(v as "asc"|"desc") }>
                <SelectTrigger className="w-32 truncate">
                  {sortOrder === "desc" ? "由新到舊" : "由舊到新"}
                </SelectTrigger>
                <SelectContent className="w-32">
                  <SelectItem value="desc">由新到舊</SelectItem>
                  <SelectItem value="asc">由舊到新</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      {/* 篩選選項 Badge 顯示區塊 */}
       <div className="flex flex-wrap gap-2 space-y-2 mt-5 mb-4 items-start">
        {selectedBadges.map(badge => (
          <Badge key={badge.type + badge.value} className="flex items-center gap-1">
            {badge.label}
            <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => handleRemoveBadge(badge.type, badge.value)}>
              <span className="sr-only">移除</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </Button>
          </Badge>
        ))}
      </div>
      {allCharts.map((chart, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row item-center justify-between">
              <div className={`space-y-2 ${idx === 0 ? 'mb-3' : 'mb-5'}`}>
                <CardTitle>{chart.title}</CardTitle>
                <CardDescription>{chart.description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="lg" className="text-lg w-20" onClick={() => setShowChart(idx)}>
                  {showArr[idx] ? "摺疊" : "展開"}
                </Button>
              </div>
            </CardHeader>
            {showArr[idx] && (
                <CardContent>
                  {sortedTestResults.length > 0 ? chart.content :
                      <div className="text-center text-gray-500 py-8">尚無任何測試結果可供圖表顯示</div>}
                </CardContent>
            )}
          </Card>
      ))}
    </div>
  )
}
