import { useMemo } from 'react';

import { useGetParticipantsQuery } from '@/api/participantsApi';
import type { Participant } from '@/schemas/participantSchema';

import { MetricsPage } from './MetricsPage';

function buildStatusData(participants: Participant[]) {
  const counts = { active: 0, completed: 0, withdrawn: 0 };
  for (const p of participants) {
    counts[p.status] = (counts[p.status] ?? 0) + 1;
  }
  return Object.entries(counts).map(([label, value]) => ({ label, value }));
}

function buildGroupData(participants: Participant[]) {
  const counts = { treatment: 0, control: 0 };
  for (const p of participants) {
    counts[p.study_group] = (counts[p.study_group] ?? 0) + 1;
  }
  return Object.entries(counts).map(([label, value]) => ({ label, value }));
}

function buildEnrollmentTrend(participants: Participant[]) {
  const byMonth: Record<string, number> = {};
  for (const p of participants) {
    const month = p.enrollment_date.slice(0, 7); // YYYY-MM
    byMonth[month] = (byMonth[month] ?? 0) + 1;
  }
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }));
}

export function MetricsPageContainer() {
  const { data: participants = [], isLoading } = useGetParticipantsQuery();

  const statusData = useMemo(
    function deriveStatusData() {
      return buildStatusData(participants);
    },
    [participants],
  );

  const groupData = useMemo(
    function deriveGroupData() {
      return buildGroupData(participants);
    },
    [participants],
  );

  const enrollmentTrendData = useMemo(
    function deriveEnrollmentTrend() {
      return buildEnrollmentTrend(participants);
    },
    [participants],
  );

  const statCards = useMemo(
    function deriveStatCards() {
      const active = participants.filter((p) => p.status === 'active').length;
      const treatment = participants.filter((p) => p.study_group === 'treatment').length;
      const avgAge = participants.length > 0 ? Math.round(participants.reduce((sum, p) => sum + p.age, 0) / participants.length) : 0;

      return [
        { label: 'Total Enrolled', value: participants.length },
        { label: 'Active', value: active },
        { label: 'Treatment Group', value: treatment },
        { label: 'Avg Age', value: avgAge },
      ];
    },
    [participants],
  );

  return (
    <MetricsPage
      isLoading={isLoading}
      statCards={statCards}
      statusData={statusData}
      groupData={groupData}
      enrollmentTrendData={enrollmentTrendData}
    />
  );
}
