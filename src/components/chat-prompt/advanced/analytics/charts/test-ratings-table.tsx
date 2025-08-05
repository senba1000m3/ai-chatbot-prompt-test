import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { XIcon } from "lucide-react"

export const TestRatingsTable: React.FC<{
  getVersionNameAction: (versionId: string) => string;
  allRubricIds: string[];
  getRubricContent: (rubricId: string) => string;
  testResults: any[];
  countMap: Record<string, number>;
}> = ({ getVersionNameAction, allRubricIds, getRubricContent, testResults, countMap }) => {

  const totalScores = testResults.map(result => {
    let sum = 0;
    let count = 0;
    allRubricIds.forEach(rubricId => {
      const score = result.ratings[result.versionId]?.[result.modelId]?.[rubricId];
      if (typeof score === 'number') {
        sum += score;
        count++;
      }
    });
    return count > 0 ? sum / count : 0;
  });

  return (
    <Card className="-pt-3">
      <CardContent>
        <div className="pt-2" style={{ overflowX: "auto" }}>
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
                    {getVersionNameAction(result.versionId)}（{countMap[`${result.versionId}|||${result.modelId}`] ?? 1}）
                    <Badge variant="secondary" className="ml-2">
                      {result.modelId}
                    </Badge>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="sticky left-0 z-10 bg-card pr-8 font-bold text-sm">總分</TableCell>
                {totalScores.map((score, idx) => (
                  <TableCell key={testResults[idx].id} className="text-center font-bold text-sm text-blue-600">
                    {score.toFixed(2)}
                  </TableCell>
                ))}
              </TableRow>
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
                            score.toFixed(2)
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

