import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Participant, ParticipantStatus } from '@/schemas/participantSchema';
import { cn } from '@/utils/cn';

type Column = {
  order: number;
  title: string;
  field: keyof Participant;
  render?: (value: Participant[keyof Participant]) => React.ReactNode;
};

const STATUS_STYLES: Record<ParticipantStatus, string> = {
  active: 'bg-green-100 text-green-800 hover:bg-green-100',
  completed: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  withdrawn: 'bg-red-100 text-red-800 hover:bg-red-100',
};

export const COLUMNS: Column[] = [
  {
    order: 1,
    title: 'Subject ID',
    field: 'subject_id',
    render: (value) => <span className='font-medium'>{String(value)}</span>,
  },
  {
    order: 2,
    title: 'Study Group',
    field: 'study_group',
    render: (value) => <span className='capitalize'>{String(value)}</span>,
  },
  {
    order: 3,
    title: 'Status',
    field: 'status',
    render: (value) => <Badge className={cn('text-xs capitalize', STATUS_STYLES[value as ParticipantStatus] ?? '')}>{String(value)}</Badge>,
  },
  {
    order: 4,
    title: 'Age',
    field: 'age',
  },
  {
    order: 5,
    title: 'Gender',
    field: 'gender',
  },
  {
    order: 6,
    title: 'Enrollment Date',
    field: 'enrollment_date',
  },
];
