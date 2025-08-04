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
  const { testResults, rubrics } = useAdvancedStore()
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
    return rubric ? rubric.content : "未知評分項"
  }

  const selectedResults = testResults.filter(result =>
    selectedResultIds.includes(result.id)
  )

  const allRubricIds = [
    ...new Set(
      selectedResults.flatMap(result =>
        Object.keys(
          result.ratings[result.versionId]?.[result.modelId] || {}
        )
      )
    ),
  ]

  const chartData = allRubricIds.map(rubricId => {
    const dataPoint: { name: string; [key: string]: string | number | null } = {
      name: getRubricContent(rubricId),
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
                        <Badge variant="outline">
                          {getVersionName(result.versionId)}
                        </Badge>
                        <Badge variant="secondary" className="ml-2">
                          {result.modelId}
                        </Badge>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allRubricIds.map(rubricId => (
                    <TableRow key={rubricId}>
                      <TableCell>{getRubricContent(rubricId)}</TableCell>
                      {selectedResults.map(result => {
                        const score =
                          result.ratings[result.versionId]?.[result.modelId]?.[
                            rubricId
                          ]
                        return (
                          <TableCell
                            key={result.id}
                            className="text-center font-medium"
                          >
                            {score !== undefined ? (
                              score
                            ) : (
                              <XIcon className="mx-auto h-4 w-4 text-muted-foreground" />
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>比較圖表</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 70,
                    left: 20,
                    bottom: 100,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
				  <Tooltip
					contentStyle={{
						backgroundColor: "hsl(var(--card))",
						borderColor: "hsl(var(--border))",
					}}
				  />
                  <XAxis
                    dataKey="name"
                    angle={80}
                    textAnchor="start"
                    interval={0}
                  />
                  <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
                  <Legend />
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

