"use client"

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts"
import { type TestResult } from "../../../../../lib/store/advanced"
import { usePromptStore } from "../../../../../lib/store/prompt"

interface TestResultsChartProps {
  data: TestResult[]
}

export const TestResultsChart = ({ data }: TestResultsChartProps) => {
  const { savedVersions } = usePromptStore()

  const getVersionName = (versionId: string) => {
    const version = savedVersions.find(v => v.id === versionId)
    return version ? version.name : "未知版本"
  }

  const calculateAverageScore = (ratings: any, versionId: string, modelId: string) => {
    const modelRatings = ratings[versionId]?.[modelId]
    if (!modelRatings) return 0

    const scores = Object.values(modelRatings) as number[]
    if (scores.length === 0) return 0

    const total = scores.reduce((acc, score) => acc + score, 0)
    return total / scores.length
  }

  const chartData = data.map(result => ({
    name: `${getVersionName(result.versionId)} (${result.modelId})`,
    averageScore: calculateAverageScore(result.ratings, result.versionId, result.modelId),
    timestamp: new Date(result.timestamp).toLocaleString(),
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={value => `${value}`}
          domain={[0, 5]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Legend />
        <Bar dataKey="averageScore" name="平均分數" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

