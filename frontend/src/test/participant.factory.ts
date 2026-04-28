import { faker } from '@faker-js/faker';

import type { CreateParticipantDto, Participant } from '@/schemas/participantSchema';

export interface IGenerateParticipant {
  status?: Participant['status'];
  study_group?: Participant['study_group'];
  gender?: Participant['gender'];
}

export function generateParticipant(overrides?: IGenerateParticipant): Participant {
  return {
    participant_id: faker.string.uuid(),
    subject_id: `P${faker.number.int({ min: 100, max: 999 })}`,
    study_group: overrides?.study_group ?? faker.helpers.arrayElement(['treatment', 'control']),
    enrollment_date: faker.date.recent({ days: 365 }).toISOString().split('T')[0],
    status: overrides?.status ?? faker.helpers.arrayElement(['active', 'completed', 'withdrawn']),
    age: faker.number.int({ min: 18, max: 80 }),
    gender: overrides?.gender ?? faker.helpers.arrayElement(['M', 'F', 'Other']),
  };
}

export function generateCreateParticipantDto(
  overrides?: IGenerateParticipant,
): CreateParticipantDto {
  const { participant_id: _, ...rest } = generateParticipant(overrides);
  return rest;
}
