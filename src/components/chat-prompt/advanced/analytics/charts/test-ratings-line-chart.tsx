import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useAdvancedStore } from "@/lib/store/advanced"

export const TestRatingsLineChart: React.FC<{
  colors: string[];
  getVersionName: Function;
  allRubricIds: string[];
  getRubricContent: (rubricId: string) => string;
}> = ({ colors, getVersionName, allRubricIds, getRubricContent }) => {

  const { testResults } = useAdvancedStore()

  const chartData = allRubricIds.map(rubricId => {
    const dataPoint: { name: string; [key: string]: string | number | null } = {
      name: getRubricContent(rubricId),
      fontColor: getRubricContent(rubricId).includes("已棄用") ? "text-red-500" : ""
    }
    testResults.forEach(result => {
      const score = result.ratings[result.versionId]?.[result.modelId]?.[rubricId]
      dataPoint[result.id] = score === undefined ? null : score
    })
    return dataPoint
  })

  return (
    <ResponsiveContainer width="100%" height={800}>
      <LineChart
        data={chartData}
        margin={{
          top: 30,
          right: 70,
          left: 20,
          bottom: 200,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip
          wrapperStyle={{ outline: "none" }}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            padding: "10px",
          }}
          labelStyle={{ marginBottom: "10px" }}
          itemStyle={{ padding: "2px 0" }}
        />
        <XAxis
          dataKey="name"
          angle={80}
          textAnchor="start"
          interval={0}
          height={300}
          dx={-5}
          dy={5}
        />
        <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
        <Legend verticalAlign="top" wrapperStyle={{ top: -10 }} />
        {testResults.map((result, index) => (
          <Line
            key={result.id}
            name={`${getVersionName(result.versionId)} (${result.modelId})`}
            dataKey={result.id}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            strokeWidth={2}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

