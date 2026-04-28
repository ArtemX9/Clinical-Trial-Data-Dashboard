import { z } from 'zod';

export const studyGroupSchema = z.enum(['treatment', 'control']);
export const participantStatusSchema = z.enum(['active', 'completed', 'withdrawn']);
export const genderSchema = z.enum(['M', 'F', 'Other']);

export const participantSchema = z.object({
  participant_id: z.string().uuid(),
  subject_id: z.string().min(1),
  study_group: studyGroupSchema,
  enrollment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  status: participantStatusSchema,
  age: z.number().int().min(0).max(150),
  gender: genderSchema,
});

export const createParticipantSchema = z.object({
  subject_id: z.string().min(1, 'Subject ID is required').max(50),
  study_group: studyGroupSchema,
  enrollment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  status: participantStatusSchema,
  age: z.number({ invalid_type_error: 'Age must be a number' }).int().min(0).max(150),
  gender: genderSchema,
});

export type Participant = z.infer<typeof participantSchema>;
export type CreateParticipantDto = z.infer<typeof createParticipantSchema>;
export type ParticipantStatus = z.infer<typeof participantStatusSchema>;
export type Gender = z.infer<typeof genderSchema>;

export interface BackendFieldError {
  field: string;
  error: string;
}

export const participantCreateErrorSchema = z.object({
  detail: z
    .array(
      z.object({
        field: z.string(),
        error: z.string(),
      }),
    )
    .optional(),
});
export type ParticipantCreateError = z.infer<typeof participantCreateErrorSchema>;
