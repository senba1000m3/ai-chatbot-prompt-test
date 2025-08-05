import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  BarChart,
} from "recharts"
import { useAdvancedStore } from "../../../../../lib/store/advanced"

export const TestRatingsLineChart: React.FC<{
  colors: string[];
  getVersionNameAction: (versionId: string) => string;
  allRubricIds: string[];
  getRubricContent: (rubricId: string) => string;
  testResults: any[];
  countMap: Record<string, number>;
}> = ({ colors, getVersionNameAction, allRubricIds, getRubricContent, testResults, countMap }) => {
  const { ratingCategories, rubrics } = useAdvancedStore();

  return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ratingCategories.map((category, catIdx) => {
            const categoryRubricIds = allRubricIds.filter(rubricId => {
              const rubric = rubrics.find(r => r.rubric_id === rubricId)
              return rubric && rubric.category_id === category.category_id
            })

            const data = categoryRubricIds.map(rubricId => {
              const entry: any = {
                rubric: getRubricContent(rubricId),
              }
              testResults.forEach(result => {
                const modelRatings = result.ratings[result.versionId]?.[result.modelId]
                const score = modelRatings?.[rubricId]
                entry[result.id] = typeof score === 'number' ? score : 0
              })
              return entry
            })

            const avgData = data.map(row => {
              let total = 0
              let count = 0
              testResults.forEach(result => {
                const score = row[result.id]
                if (typeof score === 'number') {
                  total += score
                  count++
                }
              })
              return {
                ...row,
                avg: count > 0 ? total / count : null,
              }
            })
            // 合併資料，讓 BarChart 同時有折線和長條
            const mergedData = data.map((row, idx) => ({ ...row, avg: avgData[idx].avg }))
            return (
                <div key={category.category_id}>
                  <div className="font-semibold text-xl text-center">{category.name}</div>
                  <ResponsiveContainer width="100%" height={500}>
                    <BarChart data={mergedData} margin={{ top: 50, right: 30, left: 10, bottom: 200 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="rubric" tick={{ fontSize: 12 }} interval={0} angle={60} textAnchor="start" height={60} dx={-5} dy={5} />
                      <YAxis domain={[0, 5]} ticks={[0,1,2,3,4,5]} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload) return null;
                          const sortedPayload = [
                            ...payload.filter(item => item.dataKey === 'avg'),
                            ...payload.filter(item => item.dataKey !== 'avg')
                          ];
                          return (
                            <div style={{ background: '#222', color: '#fff', border: '1px solid #222', padding: 10 }}>
                              <div style={{ marginBottom: 8 }}>{label}</div>
                              {sortedPayload.map((item, idx) => (
                                <div key={item.dataKey} style={{ color: item.dataKey === 'avg' ? '#ff6763' : colors[idx % colors.length], padding: '2px 0' }}>
                                  <span>{item.name}: </span>
                                  <span>{typeof item.value === 'number' ? item.value.toFixed(2) : item.value}</span>
                                </div>
                              ))}
                            </div>
                          )
                        }}
                      />
                      <Bar dataKey="avg" name="平均分數" fill="#ff6763" barSize={30} />
                      {testResults.map((result, idx) => (
                          <Line
                              key={result.id}
                              type="linear"
                              dataKey={result.id}
                              name={`${getVersionNameAction(result.versionId)} (${result.modelId})`}
                              stroke={colors[idx % colors.length]}
                              strokeWidth={2}
                              dot={true}
                              connectNulls
                          />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
            )
          })}
        </div>
        <div>
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-2">
            <div className="flex items-center text-sm">
              <div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: "#ff6763" }} />
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

