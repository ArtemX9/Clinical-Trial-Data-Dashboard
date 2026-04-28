import { useState } from 'react';

import { useCreateParticipantMutation } from '@/api/participantsApi';
import { BackendFieldError, CreateParticipantDto, ParticipantCreateError } from '@/schemas/participantSchema';

import { AddParticipantDialog } from './AddParticipantDialog';

export function AddParticipantDialogContainer() {
  const [isOpen, setIsOpen] = useState(false);
  const [createParticipant, { isLoading }] = useCreateParticipantMutation();

  async function handleSubmit(data: CreateParticipantDto): Promise<BackendFieldError[] | null> {
    const result = await createParticipant(data);
    console.log(result);
    if ('error' in result) {
      const apiError = result.error as { data?: ParticipantCreateError };
      return apiError.data?.detail ?? null;
    }

    setIsOpen(false);
    return null;
  }

  return <AddParticipantDialog isOpen={isOpen} isSubmitting={isLoading} onOpenChange={setIsOpen} onSubmit={handleSubmit} />;
}
