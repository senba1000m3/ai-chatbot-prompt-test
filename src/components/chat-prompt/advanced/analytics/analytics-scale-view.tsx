"use client"

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
  const { testResults } = useAdvancedStore()

  const [showTable, setShowTable] = useState(true)
  const [showRadar, setShowRadar] = useState(true)
  const [showLine, setShowLine] = useState(true)
  const [showBar, setShowBar] = useState(true)

  return (
    <div className="p-4 md:p-6 space-y-5 overflow-y-auto h-[calc(100vh-130px)]">
      <Card>
        <CardHeader className="flex flex-row item-center justify-between">
          <div className="space-y-2 mb-3">
            <CardTitle>評分比較表格</CardTitle>
            <CardDescription>
              此表格顯示所有測試的各項評分分數。
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowTable(v => !v)}>
              {showTable ? "摺疊" : "展開"}
            </Button>
          </div>
        </CardHeader>
        {showTable && (
          <CardContent>
            <TestRatingsTable />
          </CardContent>
        )}
      </Card>
      <Card>
        <CardHeader className="flex flex-row item-center justify-between">
          <div className="space-y-2 mb-5">
            <CardTitle>評分分佈雷達圖</CardTitle>
            <CardDescription>
              此圖表顯示了不同測試中，各個評分項目的平均分數。
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowRadar(v => !v)}>
              {showRadar ? "摺疊" : "展開"}
            </Button>
          </div>
        </CardHeader>
        {showRadar && (
            <CardContent>
              {testResults.length > 0 ? (
                  <TestRatingsDistributionChart data={testResults} />
              ) : (
                  <div className="text-center text-gray-500 py-8">
                    尚無任何測試結果可供圖表顯示
                  </div>
              )}
            </CardContent>
        )}
      </Card>
      <Card>
        <CardHeader className="flex flex-row item-center justify-between">
          <div className="space-y-2 mb-5">
            <CardTitle>評分折線比較圖</CardTitle>
            <CardDescription>
              此折線圖比較所有測試在各評分項目的分數。
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowLine(v => !v)}>
              {showLine ? "摺疊" : "展開"}
            </Button>
          </div>
        </CardHeader>
        {showLine && (
          <CardContent>
            <TestRatingsLineChart />
          </CardContent>
        )}
      </Card>
      <Card>
        <CardHeader className="flex flex-row item-center justify-between">
          <div className="space-y-2 mb-5">
            <CardTitle>平均平方長條圖</CardTitle>
            <CardDescription>
              此長條圖顯示了不同測試的平均分數。
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowBar(v => !v)}>
              {showBar ? "摺疊" : "展開"}
            </Button>
          </div>
        </CardHeader>
        {showBar && (
          <CardContent>
            {testResults.length > 0 ? (
              <TestResultsChart data={testResults} />
            ) : (
              <div className="text-center text-gray-500 py-8">
                尚無任何測試結果可供圖表顯示
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}

