import type { Participant } from '@/schemas/participantSchema';

import { AddParticipantDialogContainer } from './components/AddParticipantDialog/AddParticipantDialogContainer';
import { ParticipantsTable } from './components/ParticipantsTable/ParticipantsTable';

interface IParticipantsPage {
  participants: Participant[];
  isLoading: boolean;
  totalCount: number;
}

export function ParticipantsPage({ participants, isLoading, totalCount }: IParticipantsPage) {
  return (
    <div className='flex flex-col gap-6'>
      {renderPageHeader()}
      {renderTableSection()}
    </div>
  );

  function renderPageHeader() {
    return (
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold'>Participants</h1>
          <p className='mt-1 text-sm'>{totalCount} enrolled in trial</p>
        </div>
        <AddParticipantDialogContainer />
      </div>
    );
  }

  function renderTableSection() {
    return <ParticipantsTable participants={participants} isLoading={isLoading} />;
  }
}
