import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { XIcon } from "lucide-react"
import { useAdvancedStore } from "@/lib/store/advanced"
import { usePromptStore } from "@/lib/store/prompt"

export const TestRatingsTable = ({ }) => {
	const { testResults, rubrics, historyRubrics } = useAdvancedStore()
	const { savedVersions } = usePromptStore()

	const getVersionName = (versionId: string) => {
		const version = savedVersions.find(v => v.id === versionId)
		return version ? version.name : "未知版本"
	}

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

  return (
    <Card>
      <CardContent>
        <div className="pt-2" style={{ overflowX: "auto"}}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="text-base font-bold sticky left-0 z-10 bg-card pr-8"
                  style={{ position: "sticky", left: 0, zIndex: 10, background: "var(--card)", paddingRight: "2rem" }}
                >
                  評分項目
                </TableHead>
                {testResults.map(result => (
                  <TableHead key={result.id} className="text-center">
                    {getVersionName(result.versionId)}
                    <Badge variant="secondary" className="ml-2">
                      {result.modelId}
                    </Badge>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allRubricIds.map(rubricId => {
                const scores = testResults
                  .map(result => {
                    const score = result.ratings[result.versionId]?.[result.modelId]?.[rubricId]
                    return score
                  })
                  .filter(s => s !== undefined) as number[]
                const maxScore = scores.length > 0 ? Math.max(...scores) : -1
                const maxScoreCount = scores.filter(s => s === maxScore).length
                const shouldHighlight = scores.length > 1 && maxScoreCount < scores.length
                return (
                  <TableRow key={rubricId}>
                    <TableCell
                      className={`sticky left-0 z-10 bg-card pr-8 ${getRubricContent(rubricId).includes("已棄用") ? "text-red-500" : ""}`}
                    >
                      {getRubricContent(rubricId)}
                    </TableCell>
                    {testResults.map(result => {
                      const score = result.ratings[result.versionId]?.[result.modelId]?.[rubricId]
                      const isMax = shouldHighlight && score === maxScore
                      return (
                        <TableCell
                          key={result.id}
                          className={`text-center font-medium ${isMax ? "text-green-500" : ""}`}
                        >
                          {score !== undefined ? (
                            score
                          ) : (
                            <XIcon className="mx-auto h-4 w-4 text-muted-foreground text-red-500" />
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

