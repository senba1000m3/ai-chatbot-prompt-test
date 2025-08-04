"use client"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { type TestResult, useAdvancedStore } from "../../../../../lib/store/advanced"
import { usePromptStore } from "../../../../../lib/store/prompt"

interface TestRatingsDistributionChartProps {
  data: TestResult[]
}

export const TestRatingsDistributionChart = ({
  data,
}: TestRatingsDistributionChartProps) => {
  const { ratingCategories, rubrics } = useAdvancedStore()
  const { savedVersions } = usePromptStore()

  const getVersionName = (versionId: string) => {
    const version = savedVersions.find(v => v.id === versionId)
    return version ? version.name : "未知版本"
  }

  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#ca82aa",
    "#a2ca82",
  ]

  const legendPayload = data.map((result, index) => ({
    value: `${getVersionName(result.versionId)} (${result.modelId})`,
    type: "rect",
    color: colors[index % colors.length],
  }))

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {ratingCategories.map(category => {
          const categoryRubrics = rubrics.filter(
            rubric => rubric.category_id === category.category_id
          )

          if (categoryRubrics.length === 0) {
            return null
          }

          const transformedData = categoryRubrics.map(rubric => {
            const criterionScores: { [key: string]: any } = {
              subject: rubric.content,
            }
            data.forEach(result => {
              const modelRatings =
                result.ratings[result.versionId]?.[result.modelId]
              criterionScores[result.id] =
                modelRatings?.[rubric.rubric_id] || 0
            })
            return criterionScores
          })

          return (
            <div key={category.category_id}>
              <h3 className="text-lg font-semibold text-center -mb-8">
                {category.name}
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="75%"
                  data={transformedData}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 6]}
                    tickCount={7}
                    tickFormatter={value => (value > 5 ? "" : value)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                    }}
                  />
                  {data.map((result, index) => (
                    <Radar
                      key={result.id}
                      name={`${getVersionName(result.versionId)} (${
                        result.modelId
                      })`}
                      dataKey={result.id}
                      stroke={colors[index % colors.length]}
                      fill={colors[index % colors.length]}
                      fillOpacity={0.6}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
        {legendPayload.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center text-sm">
            <div
              className="w-3 h-3 mr-2 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

