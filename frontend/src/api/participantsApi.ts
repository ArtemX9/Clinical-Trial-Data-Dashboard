import { type CreateParticipantDto, type Participant, participantSchema } from '@/schemas/participantSchema';

import { api } from './api';

export const participantsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getParticipants: builder.query<Participant[], void>({
      query: () => '/api/participants',
      transformResponse: (raw: unknown) => participantSchema.array().parse(raw),
      providesTags: ['Participant'],
    }),

    getParticipantById: builder.query<Participant, string>({
      query: (id) => `/api/participants/${id}`,
      transformResponse: (raw: unknown) => participantSchema.parse(raw),
      providesTags: (_result, _error, id) => [{ type: 'Participant', id }],
    }),

    createParticipant: builder.mutation<Participant, CreateParticipantDto>({
      query: (body) => ({
        url: '/api/participants',
        method: 'POST',
        body,
      }),
      transformResponse: (raw: unknown) => participantSchema.parse(raw),
      invalidatesTags: ['Participant'],
    }),
  }),
});

export const { useGetParticipantsQuery, useGetParticipantByIdQuery, useCreateParticipantMutation } = participantsApi;
