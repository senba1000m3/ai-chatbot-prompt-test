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
import { useAdvancedStore } from "../../../../../lib/store/advanced"

export const TestRatingsDistributionChart: React.FC<{
  colors: string[];
  getVersionName: Function;
  allRubricIds: string[];
  getRubricContent: (rubricId: string) => string;
}> = ({ colors, getVersionName, allRubricIds, getRubricContent }) => {
  const { testResults, ratingCategories, rubrics } = useAdvancedStore()

  const getCategoryAverage = (rubricIds: string[]) => {
    const rubricAverages = rubricIds.map(rubricId => {
      let total = 0
      let count = 0
      testResults.forEach(result => {
        const modelRatings = result.ratings[result.versionId]?.[result.modelId]
        const score = modelRatings?.[rubricId]
        if (typeof score === 'number') {
          total += score
          count++
        }
      })
      return count > 0 ? total / count : 0
    })
    return rubricAverages.length > 0
      ? rubricAverages.reduce((a, b) => a + b, 0) / rubricAverages.length
      : 0
  }

  const legendPayload = testResults.map((result, index) => ({
    value: `${getVersionName(result.versionId)} (${result.modelId})`,
    type: "rect",
    color: colors[index % colors.length],
  }))

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {ratingCategories.map(category => {
          const categoryRubricIds = allRubricIds.filter(rubricId => {
            const rubric = rubrics.find(r => r.rubric_id === rubricId)
            return rubric && rubric.category_id === category.category_id
          })
          if (categoryRubricIds.length === 0) {
            return null
          }
          const transformedData = categoryRubricIds.map(rubricId => {
            const criterionScores: { [key: string]: any } = {
              subject: getRubricContent(rubricId),
            }
            testResults.forEach(result => {
              const modelRatings = result.ratings[result.versionId]?.[result.modelId]
              criterionScores[result.id] = modelRatings?.[rubricId] || 0
            })
            return criterionScores
          })
          const categoryAverage = getCategoryAverage(categoryRubricIds)
          return (
            <div key={category.category_id}>
              <div className="text-lg font-semibold text-center mb-1">
                {category.name}
              </div>
              <div className="text-sm font-semibold text-center -mb-2">
                平均：
                <span className="text-primary">{categoryAverage.toFixed(2)}</span>
              </div>
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
                  {testResults.map((result, index) => (
                    <Radar
                      key={result.id}
                      name={`${getVersionName(result.versionId)} (${result.modelId})`}
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

