import React from "react";
import { useAdvancedStore } from "@/lib/store/advanced";
import type { RatingCategory } from "@/lib/store/advanced";
import { usePromptStore } from "@/lib/store/prompt";

// 從 testResults 計算全部平均分前十名
function getOverallTopAveragesFromResults(testResults) {
  const scores: { versionId: string; modelId: string; avg: number }[] = [];
  for (const result of testResults) {
    for (const versionId in result.ratings) {
      for (const modelId in result.ratings[versionId]) {
        const rubricScores = Object.values(result.ratings[versionId][modelId]) as number[];
        if (rubricScores.length === 0) continue;
        const avg = rubricScores.reduce((a, b) => a + b, 0) / rubricScores.length;
        scores.push({ versionId, modelId, avg });
      }
    }
  }
  if (scores.length === 0) return [];
  return scores.sort((a, b) => b.avg - a.avg).slice(0, 10);
}

// 從 testResults 計算每個類別前十名
function getCategoryTopScoresFromResults(testResults: any[], ratingCategories: RatingCategory[], rubrics: any[]) {
  // 先根據 category_id 分組 rubrics
  const categoryRubricMap: Record<string, string[]> = {};
  for (const rubric of rubrics) {
    if (!categoryRubricMap[rubric.category_id]) categoryRubricMap[rubric.category_id] = [];
    categoryRubricMap[rubric.category_id].push(rubric.rubric_id);
  }
  const result = [];
  for (const category of ratingCategories) {
    const rubricIds = categoryRubricMap[category.category_id] || [];
    // key: versionId+modelId, value: { versionId, modelId, scores: number[] }
    const versionScores: Record<string, { versionId: string; modelId: string; scores: number[] }> = {};
    for (const testResult of testResults) {
      for (const versionId in testResult.ratings) {
        for (const modelId in testResult.ratings[versionId]) {
          const key = versionId + '|' + modelId;
          if (!versionScores[key]) versionScores[key] = { versionId, modelId, scores: [] };
          for (const rubricId of rubricIds) {
            const score = testResult.ratings[versionId][modelId][rubricId];
            if (typeof score === 'number') {
              versionScores[key].scores.push(score);
            }
          }
        }
      }
    }

    const avgScores = Object.values(versionScores)
      .filter(v => v.scores.length > 0)
      .map(v => ({ versionId: v.versionId, modelId: v.modelId, avg: v.scores.reduce((a, b) => a + b, 0) / v.scores.length }));

    const top10 = avgScores.sort((a, b) => b.avg - a.avg).slice(0, 10);
    result.push({ category, tops: top10 });
  }
  return result;
}

export const AnalyticsRankingView: React.FC = () => {
  const { testResults } = useAdvancedStore();
  const ratingCategories = useAdvancedStore(state => state.ratingCategories);
  const savedVersions = usePromptStore(state => state.savedVersions);
  const rubrics = useAdvancedStore(state => state.rubrics);

  const versionNameMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const v of savedVersions) {
      map[v.id] = v.name;
    }
    return map;
  }, [savedVersions]);

  const overallTops = getOverallTopAveragesFromResults(testResults);
  const categoryTops = getCategoryTopScoresFromResults(testResults, ratingCategories, rubrics);

  return (
    <div className="space-y-8 p-7">
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-8 text-white">
        <div className="font-bold text-lg mb-4 flex items-center gap-2">
          <span className="inline-block w-2 h-6 bg-blue-500 rounded mr-2"></span>
          全部平均前十名
        </div>
        {overallTops.length === 0 ? (
          <div className="text-gray-400">暫無資料</div>
        ) : (
          <ol className="space-y-2">
            {overallTops.map((top, idx) => (
              <li key={top.versionId + top.modelId + idx} className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 transition">
                <span className="font-bold text-blue-400 w-8">#{idx + 1}</span>
                <span className="font-semibold">{versionNameMap[top.versionId] || top.versionId}</span>
                <span className="text-gray-300">| {top.modelId}</span>
                <span className="ml-auto font-bold text-green-400">平均分: {top.avg.toFixed(2)}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryTops.map(cat => (
          <div key={cat.category.category_id} className="bg-gray-800 rounded-lg shadow p-5 text-white flex flex-col">
            <div className="font-bold text-base mb-4 flex items-center gap-2">
              <span className="inline-block w-2 h-5 bg-purple-500 rounded mr-2"></span>
              {cat.category.name}
            </div>
            <ol className="space-y-2 flex-1">
              {cat.tops.length === 0 ? (
                <li className="text-gray-400">暫無資料</li>
              ) : (
                cat.tops.map((top, idx) => (
                  <li key={top.versionId + top.modelId + idx} className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 transition">
                    <span className="font-bold text-purple-400 w-8">#{idx + 1}</span>
                    <span className="font-semibold">{versionNameMap[top.versionId] || top.versionId}</span>
                    <span className="text-gray-300">| {top.modelId}</span>
                    <span className="ml-auto font-bold text-green-400">分數: {top.avg.toFixed(2)}</span>
                  </li>
                ))
              )}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsRankingView;

