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
  Cell,
} from "recharts"
export const TestResultsChart: React.FC<{ colors: string[]; getVersionName: Function }> = ({
  colors, getVersionName
}) => {
  const { testResults } = useAdvancedStore();

  const calculateAverageScore = (ratings: any, versionId: string, modelId: string) => {
    const modelRatings = ratings[versionId]?.[modelId]
    if (!modelRatings) return 0

    const scores = Object.values(modelRatings) as number[]
    if (scores.length === 0) return 0

    const total = scores.reduce((acc, score) => acc + score, 0)
    return total / scores.length
  }

  const chartData = testResults.map(result => ({
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
              ticks={[0, 1, 2, 3, 4, 5]}
          />
          <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Legend />
          <Bar dataKey="averageScore" name="平均分數" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
  )
}

import { useAdvancedStore, type TestResult } from "../../../../../lib/store/advanced"

