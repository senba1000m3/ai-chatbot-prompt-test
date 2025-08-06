import React from "react";
import { useAdvancedStore } from "@/lib/store/advanced";
import { type RatingCategory, type TestResult } from "@/lib/store/advanced";
import { usePromptStore } from "@/lib/store/prompt";
import { mergeTestResults } from "./merge-test-results";

function getOverallTopAveragesFromResults(testResults: TestResult[]) {
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


function getCategoryTopScoresFromResults(testResults: TestResult[], ratingCategories: RatingCategory[], rubrics: any[]) {
  const categoryRubricMap: Record<string, string[]> = {};
  for (const rubric of rubrics) {
    if (!categoryRubricMap[rubric.category_id]) categoryRubricMap[rubric.category_id] = [];
    categoryRubricMap[rubric.category_id].push(rubric.rubric_id);
  }
  const result = [];
  for (const category of ratingCategories) {
    const rubricIds = categoryRubricMap[category.category_id] || [];
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

  const { mergedResults, countMap } = mergeTestResults(testResults);
  
  const overallTops = getOverallTopAveragesFromResults(mergedResults);
  const categoryTops = getCategoryTopScoresFromResults(mergedResults, ratingCategories, rubrics);

  return (
    <div className="space-y-8 p-7 overflow-y-auto h-[calc(100vh-130px)]">
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-6 text-white">
        <div className="font-bold text-lg mb-6 flex items-center gap-2">
          <span className="inline-block w-2 h-6 bg-blue-500 rounded mr-2"></span>
          全部平均（前十名）
        </div>
        <div className="flex items-center gap-3 px-2 py-1 font-semibold text-gray-300 border-b border-gray-700 mb-2">
          <span className="w-15">排名</span>
          <span className="flex-1">版本名稱</span>
          <span className="flex-1">使用模型</span>
          <span className="w-16 text-center">次數</span>
          <span className="w-20 text-center">分數</span>
        </div>
        {overallTops.length === 0 ? (
          <div className="text-gray-400">暫無資料</div>
        ) : (
          <ol className="space-y-2">
            {overallTops.map((top, idx) => (
              <li key={top.versionId + top.modelId + idx} className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 transition">
                <span className="font-bold text-blue-400 w-15">#{idx + 1}</span>
                <span className="font-semibold flex-1">{versionNameMap[top.versionId] || top.versionId}</span>
                <span className="text-gray-300 flex-1 ml-5">{top.modelId}</span>
                <span className="ml-4 w-16 text-center text-base text-gray-400">{countMap[`${top.versionId}|||${top.modelId}`]}</span>
                <span className="ml-auto w-20 text-center font-bold"
                  style={{ color: top.avg === 5 ? '#65dbff' : top.avg >= 4 ? '#22c55e' : top.avg >= 3 ? '#eab308' : '#ef4444' }}>
                  {top.avg.toFixed(2)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryTops.map(cat => (
          <div key={cat.category.category_id} className="bg-gray-800 rounded-lg shadow p-5 text-white flex flex-col">
            <div className="font-bold text-lg mb-6 flex items-center gap-2">
              <span className="inline-block w-2 h-5 bg-purple-500 rounded mr-2"></span>
              {cat.category.name}（前十名）
            </div>
            <div className="flex items-center gap-3 px-2 py-1 font-semibold text-gray-300 border-b border-gray-700 mb-2">
              <span className="w-15">排名</span>
              <span className="flex-1">版本名稱</span>
              <span className="flex-1">使用模型</span>
              <span className="w-16 text-center">次數</span>
              <span className="w-20 text-center">分數</span>
            </div>
            <ol className="space-y-2 flex-1">
              {cat.tops.length === 0 ? (
                <li className="text-gray-400">暫無資料</li>
              ) : (
                cat.tops.map((top, idx) => (
                  <li key={top.versionId + top.modelId + idx} className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 transition">
                    <span className="font-bold text-purple-400 w-15">#{idx + 1}</span>
                    <span className="font-semibold flex-1">{versionNameMap[top.versionId] || top.versionId}</span>
                    <span className="text-gray-300 flex-1 ml-5">{top.modelId}</span>
                    <span className="ml-4 w-16 text-center text-base text-gray-400">{countMap[`${top.versionId}|||${top.modelId}`]}</span>
                    <span className="ml-auto w-20 text-center font-bold"
                      style={{ color: top.avg === 5 ? '#65dbff' : top.avg >= 4 ? '#22c55e' : top.avg >= 3 ? '#eab308' : '#ef4444' }}>
                      {top.avg.toFixed(2)}
                    </span>
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


