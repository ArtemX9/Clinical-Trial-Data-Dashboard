import { CartesianGrid, Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface ILineChartDataPoint {
  label: string;
  value: number;
}

interface ILineChart {
  data: ILineChartDataPoint[];
  color?: string;
  height?: number;
}

export function LineChart({ data, color = 'hsl(189,94%,33%)', height = 300 }: ILineChart) {
  const chartData = data.map((d) => ({ name: d.label, value: d.value }));

  return (
    <ResponsiveContainer width='100%' height={height}>
      <RechartsLineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray='3 3' stroke='hsl(214,32%,91%)' />
        <XAxis dataKey='name' tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line type='monotone' dataKey='value' stroke={color} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
