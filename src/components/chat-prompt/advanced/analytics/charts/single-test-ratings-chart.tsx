import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAdvancedStore } from "@/lib/store/advanced";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, LabelList } from "recharts";

export const SingleTestRatingsChart: React.FC<{
	getVersionNameAction: (versionId: string) => string;
  	colors: string[];
  	testResults: any[];
  	countMap: Record<string, number>;
}> = ({ getVersionNameAction, colors, testResults, countMap }) => {
  const { ratingCategories, rubrics } = useAdvancedStore();

  const categoryRubricMap: Record<string, string[]> = {};
  rubrics.forEach(rubric => {
    if (!categoryRubricMap[rubric.category_id]) categoryRubricMap[rubric.category_id] = [];
    categoryRubricMap[rubric.category_id].push(rubric.rubric_id);
  });

  return (
    <div className="flex flex-wrap w-full">
      {testResults.map((result, idx) => {
        const key = `${result.versionId}|||${result.modelId}`;
        // 每個分類的平均分數
        const categoryAverages = ratingCategories.map(cat => {
          const rubricIds = categoryRubricMap[cat.category_id] || [];
          const scores = rubricIds.map(rubricId => result.ratings[result.versionId]?.[result.modelId]?.[rubricId]).filter(s => typeof s === 'number') as number[];
          const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
          return { name: cat.name, avg };
        });
        const chartWidth = testResults.length === 1 ? '100%' : '50%';
        return (
          <div
            key={result.id}
            className="p-2"
            style={{ width: chartWidth, minWidth: 320, boxSizing: 'border-box' }}
          >
            <Card className="mb-4 h-full">
              <CardContent>
                <div className="mt-9 mb-6 font-bold text-base flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-10 justify-between">
                    <span>版本：{getVersionNameAction(result.versionId)}</span>
                    <span>使用模型：{result.modelId}</span>
                    <span>評分次數：{countMap[key] ?? 1}</span>
                  </div>
                </div>
                {/*<Table>*/}
                {/*  <TableHeader>*/}
                {/*    <TableRow>*/}
                {/*      <TableHead className="text-center text-sm font-medium">分類</TableHead>*/}
                {/*      <TableHead className="text-center text-sm font-medium">平均分數</TableHead>*/}
                {/*    </TableRow>*/}
                {/*  </TableHeader>*/}
                {/*  <TableBody>*/}
                {/*    {categoryAverages.map(cat => (*/}
                {/*      <TableRow key={cat.name}>*/}
                {/*        <TableCell className="text-center text-xs">{cat.name}</TableCell>*/}
                {/*        <TableCell className="font-bold text-blue-600 text-center text-xs">{cat.avg.toFixed(2)}</TableCell>*/}
                {/*      </TableRow>*/}
                {/*    ))}*/}
                {/*  </TableBody>*/}
                {/*</Table>*/}
                <div className="-ml-10">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={categoryAverages}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} allowDataOverflow={false} interval={0} />
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
                      <Bar dataKey="avg" name="平均分數" radius={[4, 4, 0, 0]} barSize={50}>
                        {categoryAverages.map((cat, i) => (
                          <Cell key={cat.name} fill={colors[i % colors.length]} />
                        ))}
                        <LabelList dataKey="avg" position="middle" formatter={(v) => Number(v).toFixed(2)} style={{fontWeight: 'bold', fontSize: 14, fill: '#fff' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

