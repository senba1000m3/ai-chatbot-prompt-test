"use client"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
} from "recharts"
import { useAdvancedStore } from "../../../../../lib/store/advanced"

export const TestRatingsRadarChart: React.FC<{
  	colors: string[];
	getVersionNameAction: (versionId: string) => string;
  	allRubricIds: string[];
  	getRubricContent: (rubricId: string) => string;
  	testResults: any[];
  	countMap: any;
}> = ({ colors, getVersionNameAction, allRubricIds, testResults, countMap }) => {
  const { ratingCategories, rubrics } = useAdvancedStore()

  const radarData = ratingCategories.map(category => {
    const categoryRubricIds = allRubricIds.filter(rubricId => {
      const rubric = rubrics.find(r => r.rubric_id === rubricId)
      return rubric && rubric.category_id === category.category_id
    })
    let total = 0
    let count = 0
    categoryRubricIds.forEach(rubricId => {
      testResults.forEach(result => {
        const modelRatings = result.ratings[result.versionId]?.[result.modelId]
        const score = modelRatings?.[rubricId]
        if (typeof score === 'number') {
          total += score
          count++
        }
      })
    })
    const entry: any = {
      category: category.name,
      avg: count > 0 ? total / count : 0,
    }
    // 各測試版本
    testResults.forEach((result, idx) => {
      let total = 0
      let count = 0
      categoryRubricIds.forEach(rubricId => {
        const modelRatings = result.ratings[result.versionId]?.[result.modelId]
        const score = modelRatings?.[rubricId]
        if (typeof score === 'number') {
          total += score
          count++
        }
      })
      entry[result.id] = count > 0 ? total / count : 0
    })
    return entry
  })

  return (
    <div className="space-y-8">
      <div className="w-full flex flex-col items-center">
        <div className="text-xl font-semibold text-center mb-1">各分類分數雷達圖</div>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 6]} tickCount={7} tickFormatter={value => (value > 5 ? "" : value)} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload) return null;

                const sortedPayload = [...payload].sort((a, b) => {
                  if (a.dataKey === 'avg') return -1;
                  if (b.dataKey === 'avg') return 1;
                  return 0;
                });
                return (
                  <div style={{ background: '#222', color: '#fff', border: '1px solid #222', padding: 10 }}>
                    <div style={{ marginBottom: 8 }}>{label}</div>
                    {sortedPayload.map((item, idx) => (
                      <div
                        key={item.dataKey}
                        style={{
                          color: item.dataKey === 'avg' ? '#e53935' : colors[idx % colors.length],
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
            <Radar name="平均分數" dataKey="avg" stroke="#e53935" fill="#e53935" fillOpacity={0.6} strokeWidth={3} />
            {testResults.map((result, idx) => (
              <Radar
                key={result.id}
                name={`${getVersionNameAction(result.versionId)} (${result.modelId})`}
                dataKey={result.id}
                stroke={colors[idx % colors.length]}
                fill={colors[idx % colors.length]}
                fillOpacity={0.3}
                strokeWidth={3}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-2">
          <div className="flex items-center text-sm">
            <div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#e53935" }} />
            <span>平均分數</span>
          </div>
          {testResults.map((result, idx) => (
            <div key={`legend-radar-${idx}`} className="flex items-center text-sm">
              <div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: colors[idx % colors.length] }} />
              <span>{getVersionNameAction(result.versionId)} ({result.modelId})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

