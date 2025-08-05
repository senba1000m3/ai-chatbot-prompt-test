"use client"

import { TestRatingsTable } from "./charts/test-ratings-table"
import { TestRatingsLineChart } from "./charts/test-ratings-line-chart"
import { XIcon } from "lucide-react"

export const AnalyticsCompareView = () => {

  return (
    <div className="p-4 md:p-6 space-y-7 overflow-y-auto h-[calc(100vh-130px)]">
      {/* 直接顯示全部結果，不再顯示選擇器 */}
      {/*<TestRatingsTable />*/}
      {/*<TestRatingsLineChart />*/}
    </div>
  )
}


