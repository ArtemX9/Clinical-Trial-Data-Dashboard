import { type ILineChartDataPoint, LineChart } from '@/components/charts/LineChart/LineChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IEnrollmentTrendChart {
  data: ILineChartDataPoint[];
}

export function EnrollmentTrendChart({ data }: IEnrollmentTrendChart) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>Enrollment Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart data={data} />
      </CardContent>
    </Card>
  );
}
