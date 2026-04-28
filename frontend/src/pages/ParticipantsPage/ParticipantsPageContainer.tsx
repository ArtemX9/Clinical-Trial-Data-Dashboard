import { useGetParticipantsQuery } from '@/api/participantsApi';

import { ParticipantsPage } from './ParticipantsPage';

export function ParticipantsPageContainer() {
  const { data: participants = [], isLoading } = useGetParticipantsQuery();

  return <ParticipantsPage participants={participants} isLoading={isLoading} totalCount={participants.length} />;
}
