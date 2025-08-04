"use client"

import { useState } from "react"
import { useAdvancedStore } from "@/lib/store/advanced"
import { usePromptStore } from "@/lib/store/prompt"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnalyticsCompareDialog } from "./analytics-compare-dialog"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { XIcon } from "lucide-react"

export const AnalyticsCompareView = () => {
  const { testResults, rubrics, historyRubrics } = useAdvancedStore()
  const { savedVersions } = usePromptStore()
  const [selectedResultIds, setSelectedResultIds] = useState<string[]>([])

  const handleCompare = (selectedIds: string[]) => {
    setSelectedResultIds(selectedIds)
  }

  const getVersionName = (versionId: string) => {
    const version = savedVersions.find(v => v.id === versionId)
    return version ? version.name : "未知版本"
  }

  const getRubricContent = (rubricId: string) => {
    const rubric = rubrics.find(r => r.rubric_id === rubricId)
    if (rubric) {
      return rubric.content
    }
    const historyRubric = (historyRubrics || []).find(
      r => r.rubric_id === rubricId
    )
    if (historyRubric) {
      return `${historyRubric.content} (已棄用)`
    }
    return "未知評分項"
  }

  const selectedResults = testResults.filter(result =>
    selectedResultIds.includes(result.id)
  )

  const allRubricIds = (() => {
    const { ratingCategories, rubrics, historyRubrics } =
      useAdvancedStore.getState()
    const allAvailableRubrics = [...rubrics, ...(historyRubrics || [])]

    const allRubricIdsFromRatings = selectedResults.flatMap(result =>
      Object.values(result.ratings).flatMap(modelRatings =>
        Object.values(modelRatings).flatMap(rubricScores =>
          Object.keys(rubricScores)
        )
      )
    )
    const uniqueRubricIds = [...new Set(allRubricIdsFromRatings)]

    const rubricIdToCategoryId: Record<string, string> = {}
    uniqueRubricIds.forEach(rubricId => {
      const rubricInfo = allAvailableRubrics.find(
        r => r.rubric_id === rubricId
      )
      if (rubricInfo) {
        rubricIdToCategoryId[rubricId] = rubricInfo.category_id
      }
    })

    return uniqueRubricIds.sort((a, b) => {
      const categoryA = rubricIdToCategoryId[a]
      const categoryB = rubricIdToCategoryId[b]
      const indexA = ratingCategories.findIndex(
        c => c.category_id === categoryA
      )
      const indexB = ratingCategories.findIndex(
        c => c.category_id === categoryB
      )
      return indexA - indexB
    })
  })()

  const chartData = allRubricIds.map(rubricId => {
    const dataPoint: { name: string; [key: string]: string | number | null } = {
      name: getRubricContent(rubricId),
	  fontColor: getRubricContent(rubricId).includes("已棄用") ? "text-red-500" : ""
    }
    selectedResults.forEach(result => {
      const seriesName = `${getVersionName(result.versionId)} (${
        result.modelId
      })`
      const score =
        result.ratings[result.versionId]?.[result.modelId]?.[rubricId]
      dataPoint[seriesName] = score === undefined ? null : score
    })
    return dataPoint
  })

  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#ca82aa",
    "#a2ca82",
  ]

  return (
    <div className="p-4 md:p-6 space-y-7 overflow-y-auto h-[calc(100vh-130px)]">
      <div className="flex justify-start">
        <AnalyticsCompareDialog onCompare={handleCompare} />
      </div>

      {selectedResults.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>比較表格</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>評分項目</TableHead>
                    {selectedResults.map(result => (
                      <TableHead key={result.id} className="text-center">
                        {getVersionName(result.versionId)}
                        <Badge variant="secondary" className="ml-2">
                          {result.modelId}
                        </Badge>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allRubricIds.map(rubricId => {
                    const scores = selectedResults
                      .map(result => {
                        const score =
                          result.ratings[result.versionId]?.[result.modelId]?.[
                            rubricId
                          ]
                        return score
                      })
                      .filter(s => s !== undefined) as number[]

                    const maxScore = scores.length > 0 ? Math.max(...scores) : -1
                    const maxScoreCount = scores.filter(
                      s => s === maxScore
                    ).length
                    const shouldHighlight =
                      scores.length > 1 && maxScoreCount < scores.length

                    return (
                      <TableRow key={rubricId}>
						<TableCell className={getRubricContent(rubricId).includes("已棄用") ? "text-red-500" : ""}>{getRubricContent(rubricId)}</TableCell>
                        {selectedResults.map(result => {
                          const score =
                            result.ratings[result.versionId]?.[
                              result.modelId
                            ]?.[rubricId]
                          const isMax = shouldHighlight && score === maxScore
                          return (
                            <TableCell
                              key={result.id}
                              className={`text-center font-medium ${
                                isMax ? "text-green-500" : ""
                              }`}
                            >
                              {score !== undefined ? (
                                score
                              ) : (
                                <XIcon className="mx-auto h-4 w-4 text-muted-foreground text-red-500" />
                              )}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>比較圖表</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={800}>
                <LineChart
                  data={chartData}
                  margin={{
                    top: 30,
                    right: 70,
                    left: 20,
                    bottom: 200,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip
                    wrapperStyle={{ outline: "none" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      padding: "10px",
                    }}
                    labelStyle={{ marginBottom: "10px" }}
                    itemStyle={{ padding: "2px 0" }}
                  />
                  <XAxis
                    dataKey="name"
                    angle={80}
                    textAnchor="start"
                    interval={0}
                    height={300}
                    dx={-5}
                    dy={5}
                  />
                  <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
                  <Legend verticalAlign="top" wrapperStyle={{ top: -10 }} />
                  {selectedResults.map((result, index) => (
                    <Line
                      key={result.id}
                      dataKey={`${getVersionName(result.versionId)} (${
                        result.modelId
                      })`}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

