import { BarChart, type IBarChartDataPoint } from '@/components/charts/BarChart/BarChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IGroupDistributionChart {
  data: IBarChartDataPoint[];
}

export function GroupDistributionChart({ data }: IGroupDistributionChart) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>Treatment vs Control</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart data={data} />
      </CardContent>
    </Card>
  );
}
