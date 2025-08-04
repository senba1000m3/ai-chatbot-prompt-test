"use client"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import { type TestResult, useAdvancedStore } from "../../../../../lib/store/advanced"
import { usePromptStore } from "../../../../../lib/store/prompt"

interface TestRatingsDistributionChartProps {
  data: TestResult[]
}

export const TestRatingsDistributionChart = ({
  data,
}: TestRatingsDistributionChartProps) => {
  const { rubrics } = useAdvancedStore()
  const { savedVersions } = usePromptStore()

  const getVersionName = (versionId: string) => {
    const version = savedVersions.find(v => v.id === versionId)
    return version ? version.name : "未知版本"
  }

  // We need to transform the data for RadarChart:
  // Each object in the array should represent a criterion (subject) from the rubrics
  const transformedData = rubrics.map(rubric => {
    const criterionScores: { [key: string]: any } = { subject: rubric.content }
    data.forEach(result => {
      const seriesName = `${getVersionName(result.versionId)} (${result.modelId})`
      const modelRatings = result.ratings[result.versionId]?.[result.modelId]
      criterionScores[seriesName] = modelRatings?.[rubric.rubric_id] || 0
    })
    return criterionScores
  })

  const colors = [
    "hsl(var(--primary))",
    "hsl(var(--secondary-foreground))",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
  ]

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={transformedData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 5]} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
          }}
        />
        <Legend />
        {data.map((result, index) => (
          <Radar
            key={result.id}
            name={`${getVersionName(result.versionId)} (${result.modelId})`}
            dataKey={`${getVersionName(result.versionId)} (${result.modelId})`}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.6}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  )
}

