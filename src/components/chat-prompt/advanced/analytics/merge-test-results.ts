import { TestResult } from "@/lib/store/advanced";

/**
 * 合併同版本-模型的測試結果，並計算每個組合的數量，ratings 取平均
 * @param results TestResult[]
 * @returns { mergedResults: TestResult[], countMap: Record<string, number> }
 */
export function mergeTestResults(results: TestResult[]) {
  const groupMap: Record<string, TestResult[]> = {};
  const countMap: Record<string, number> = {};
  results.forEach(result => {
    const key = `${result.versionId}|||${result.modelId}`;
    if (!groupMap[key]) groupMap[key] = [];
    groupMap[key].push(result);
    countMap[key] = (countMap[key] || 0) + 1;
  });

  const mergedResults: TestResult[] = Object.entries(groupMap).map(([key, group]) => {
    const { versionId, modelId } = group[0];
    // 合併 ratings 取平均
    const ratings: any = {};
    group.forEach(result => {
      Object.keys(result.ratings).forEach(verId => {
        if (!ratings[verId]) ratings[verId] = {};
        Object.keys(result.ratings[verId]).forEach(modelId2 => {
          if (!ratings[verId][modelId2]) ratings[verId][modelId2] = {};
          Object.keys(result.ratings[verId][modelId2]).forEach(rubricId => {
            if (!Array.isArray(ratings[verId][modelId2][rubricId])) ratings[verId][modelId2][rubricId] = [];
            ratings[verId][modelId2][rubricId].push(result.ratings[verId][modelId2][rubricId]);
          });
        });
      });
    });
    // ratings 取平均
    Object.keys(ratings).forEach(verId => {
      Object.keys(ratings[verId]).forEach(modelId2 => {
        Object.keys(ratings[verId][modelId2]).forEach(rubricId => {
          const arr = ratings[verId][modelId2][rubricId];
          ratings[verId][modelId2][rubricId] = arr.reduce((a: number, b: number) => a + b, 0) / arr.length;
        });
      });
    });
    // messages 只取第一筆
    const messages = group[0].messages;
    // 其他欄位取第一筆
    return {
      ...group[0],
      ratings,
      messages,
      mergedIds: group.map(r => r.id),
    };
  });

  return { mergedResults, countMap };
}
