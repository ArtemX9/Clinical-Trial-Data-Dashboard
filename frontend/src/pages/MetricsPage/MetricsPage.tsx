import type { IBarChartDataPoint } from '@/components/charts/BarChart/BarChart';
import type { ILineChartDataPoint } from '@/components/charts/LineChart/LineChart';
import type { IPieChartDataPoint } from '@/components/charts/PieChart/PieChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { EnrollmentTrendChart } from './components/EnrollmentTrendChart/EnrollmentTrendChart';
import { GroupDistributionChart } from './components/GroupDistributionChart/GroupDistributionChart';
import { StatusChart } from './components/StatusChart/StatusChart';

interface IStatCard {
  label: string;
  value: number | string;
}

interface IMetricsPage {
  isLoading: boolean;
  statCards: IStatCard[];
  statusData: IPieChartDataPoint[];
  groupData: IBarChartDataPoint[];
  enrollmentTrendData: ILineChartDataPoint[];
}

export function MetricsPage({ isLoading, statCards, statusData, groupData, enrollmentTrendData }: IMetricsPage) {
  if (isLoading) {
    return renderLoadingState();
  }

  return (
    <div className='flex flex-col gap-6'>
      {renderPageHeader()}
      {renderStatCards()}
      {renderCharts()}
    </div>
  );

  function renderPageHeader() {
    return (
      <div>
        <h1 className='text-2xl font-semibold'>Metrics</h1>
        <p className='mt-1 text-sm'>Trial overview and enrollment analytics</p>
      </div>
    );
  }

  function renderStatCards() {
    return (
      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className='pb-2'>
              <CardTitle className='text-xs font-medium uppercase tracking-wide'>{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-3xl font-bold text-foreground'>{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  function renderCharts() {
    return (
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <StatusChart data={statusData} />
        <GroupDistributionChart data={groupData} />
        <div className='md:col-span-2'>
          <EnrollmentTrendChart data={enrollmentTrendData} />
        </div>
      </div>
    );
  }

  function renderLoadingState() {
    return (
      <div className='flex flex-col gap-6'>
        <Skeleton className='h-8 w-48' />
        <div className='grid grid-cols-4 gap-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-24 w-full' />
          ))}
        </div>
        <div className='grid grid-cols-2 gap-6'>
          <Skeleton className='h-80 w-full' />
          <Skeleton className='h-80 w-full' />
        </div>
      </div>
    );
  }
}
