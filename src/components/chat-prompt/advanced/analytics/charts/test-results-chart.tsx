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
export const TestResultsChart: React.FC<{
    colors: string[];
    getVersionNameAction: (versionId: string) => string;
    testResults: any[];
    countMap: Record<string, number>;
}> = ({
  colors, getVersionNameAction, testResults, countMap
}) => {
  const calculateAverageScore = (ratings: any, versionId: string, modelId: string) => {
    const modelRatings = ratings[versionId]?.[modelId]
    if (!modelRatings) return 0

    const scores = Object.values(modelRatings) as number[]
    if (scores.length === 0) return 0

    const total = scores.reduce((acc, score) => acc + score, 0)
    return total / scores.length
  }

  const chartData = testResults.map(result => ({
    name: `${getVersionNameAction(result.versionId)} (${result.modelId}）（${countMap[`${result.versionId}|||${result.modelId}`] ?? 1}）`,
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
              fontSize={16}
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
              content={({ active, payload, label }) => {
                if (!active || !payload) return null;
                return (
                    <div style={{ background: '#222', color: '#fff', border: '1px solid #222', padding: 10 }}>
                      <div style={{ marginBottom: 8 }}>{label}</div>
                      {payload.map((item, idx) => (
                          <div
                              key={item.dataKey}
                              style={{
                                color: colors[idx % colors.length],
                                padding: '2px 0'
                              }}
                          >
                            <span>{item.name}: </span>
                            <span>{typeof item.value === 'number' ? item.value.toFixed(2) : item.value}</span>
                          </div>
                      ))}
                    </div>
                );
              }}
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

import { type TestResult } from "../../../../../lib/store/advanced"
