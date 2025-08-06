import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts"
import { type TestResult } from "../../../../../lib/store/advanced"

export const TestCountChart: React.FC<{
  	colors: string[];
	getVersionNameAction: (versionId: string) => string;
  	testResults: TestResult[];
  	countMap: Record<string, number>;
}> = ({ colors, getVersionNameAction, testResults, countMap }) => {
  const chartData = testResults.map(result => ({
    name: `${getVersionNameAction(result.versionId)} (${result.modelId}）`,
    count: countMap[`${result.versionId}|||${result.modelId}`] ?? 0,
    timestamp: new Date(result.timestamp).toLocaleString(),
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={16}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={value => `${value}`}
          allowDecimals={false}
        />
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
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            );
          }}
        />
        <Legend />
        <Bar dataKey="count" name="總資料數" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

