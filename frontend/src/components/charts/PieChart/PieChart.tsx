import { Legend, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from 'recharts';

export interface IPieChartDataPoint {
  label: string;
  value: number;
}

interface IPieChart {
  data: IPieChartDataPoint[];
  colors?: string[];
  height?: number;
}

const DEFAULT_COLORS = ['hsl(189,94%,33%)', 'hsl(215,16%,47%)', 'hsl(0,84%,60%)', 'hsl(45,93%,47%)'];

export function PieChart({ data, colors = DEFAULT_COLORS, height = 300 }: IPieChart) {
  const chartData = data.map((d, index) => ({
    name: d.label,
    value: d.value,
    fill: colors[index % colors.length],
  }));

  return (
    <ResponsiveContainer width='100%' height={height}>
      <RechartsPieChart>
        <Pie
          data={chartData}
          cx='50%'
          cy='50%'
          outerRadius={100}
          dataKey='value'
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={false}
        />
        <Tooltip />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
