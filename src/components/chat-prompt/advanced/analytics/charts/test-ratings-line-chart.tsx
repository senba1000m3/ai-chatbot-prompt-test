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
import { usePromptStore } from "@/lib/store/prompt"

const colors = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#ca82aa",
  "#a2ca82",
]

export const TestRatingsLineChart = ({ }) => {
	const { testResults, rubrics, historyRubrics } = useAdvancedStore()
	const { savedVersions } = usePromptStore()

	const getVersionName = (versionId: string) => {
		const version = savedVersions.find(v => v.id === versionId)
		return version ? version.name : "未知版本"
	}

	const allRubricIds = (() => {
		const { ratingCategories, rubrics, historyRubrics } =
			useAdvancedStore.getState()
		const allAvailableRubrics = [...rubrics, ...(historyRubrics || [])]
		const allRubricIdsFromRatings = testResults.flatMap(result =>
			Object.values(result.ratings).flatMap(modelRatings =>
				Object.values(modelRatings).flatMap(rubricScores =>
					Object.keys(rubricScores)
				)
			)
		)
		const uniqueRubricIds = [...new Set(allRubricIdsFromRatings)]
		const rubricIdToCategoryId: Record<string, string> = {}
		uniqueRubricIds.forEach(rubricId => {
			const rubricInfo = allAvailableRubrics.find(
				r => r.rubric_id === rubricId
			)
			if (rubricInfo) {
				rubricIdToCategoryId[rubricId] = rubricInfo.category_id
			}
		})
		return uniqueRubricIds.sort((a, b) => {
			const categoryA = rubricIdToCategoryId[a]
			const categoryB = rubricIdToCategoryId[b]
			const indexA = ratingCategories.findIndex(
				c => c.category_id === categoryA
			)
			const indexB = ratingCategories.findIndex(
				c => c.category_id === categoryB
			)
			return indexA - indexB
		})
	})()

	const getRubricContent = (rubricId: string) => {
		const rubric = rubrics.find(r => r.rubric_id === rubricId)
		if (rubric) {
			return rubric.content
		}
		const historyRubric = (historyRubrics || []).find(
			r => r.rubric_id === rubricId
		)
		if (historyRubric) {
			return `${historyRubric.content} (已棄用)`
		}
		return "未知評分項"
	}

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

