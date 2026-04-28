import { type IPieChartDataPoint, PieChart } from '@/components/charts/PieChart/PieChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IStatusChart {
  data: IPieChartDataPoint[];
}

export function StatusChart({ data }: IStatusChart) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>Participants by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <PieChart data={data} />
      </CardContent>
    </Card>
  );
}
