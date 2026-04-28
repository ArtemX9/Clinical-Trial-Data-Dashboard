import { Bar, CartesianGrid, BarChart as RechartsBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface IBarChartDataPoint {
  label: string;
  value: number;
}

interface IBarChart {
  data: IBarChartDataPoint[];
  color?: string;
  height?: number;
}

export function BarChart({ data, color = 'hsl(189,94%,33%)', height = 300 }: IBarChart) {
  const chartData = data.map((d) => ({ name: d.label, value: d.value }));

  return (
    <ResponsiveContainer width='100%' height={height}>
      <RechartsBarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray='3 3' stroke='hsl(214,32%,91%)' />
        <XAxis dataKey='name' tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey='value' fill={color} radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
