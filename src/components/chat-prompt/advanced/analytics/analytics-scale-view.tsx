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

export const AnalyticsScaleView = () => {
  const { testResults } = useAdvancedStore()

  return (
    <div className="p-4 md:p-6 space-y-7 overflow-y-auto h-[calc(100vh-130px)]">
		<Card>
			<CardHeader>
				<CardTitle>評分分佈雷達圖</CardTitle>
				<CardDescription>
					此圖表顯示了不同測試中，各個評分項目的平均分數。
				</CardDescription>
			</CardHeader>
			<CardContent>
				{testResults.length > 0 ? (
					<TestRatingsDistributionChart data={testResults} />
				) : (
					<div className="text-center text-gray-500 py-8">
						尚無任何測試結果可供圖表顯示
					</div>
				)}
			</CardContent>
		</Card>
		<Card>
			<CardHeader>
				<CardTitle>測試結果圖表</CardTitle>
				<CardDescription>
					此長條圖顯示了不同測試的平均分數。
				</CardDescription>
			</CardHeader>
			<CardContent>
				{testResults.length > 0 ? (
					<TestResultsChart data={testResults} />
				) : (
					<div className="text-center text-gray-500 py-8">
						尚無任何測試結果可供圖表顯示
					</div>
				)}
			</CardContent>
		</Card>
	</div>
  )
}

