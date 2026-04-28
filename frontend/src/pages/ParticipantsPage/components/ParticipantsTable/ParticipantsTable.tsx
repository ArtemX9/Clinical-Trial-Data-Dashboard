import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { COLUMNS } from '@/pages/ParticipantsPage/components/ParticipantsTable/constants';
import { Participant } from '@/schemas/participantSchema';

interface IParticipantsTable {
  participants: Participant[];
  isLoading: boolean;
}

export function ParticipantsTable({ participants, isLoading }: IParticipantsTable) {
  if (isLoading) {
    return renderSkeleton();
  }

  return (
    <div className='rounded-md border border-border'>
      <Table>
        {renderHead()}
        {renderBody()}
      </Table>
    </div>
  );

  function renderHead() {
    return (
      <TableHeader>
        <TableRow className='bg-muted/50'>
          {COLUMNS.map((c) => (
            <TableHead key={c.title}>{c.title}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
    );
  }

  function renderBody() {
    if (participants.length === 0) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={COLUMNS.length} className='py-10 text-center text-muted-foreground'>
              No participants enrolled yet.
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    return (
      <TableBody>
        {participants.map((p) => (
          <TableRow key={p.participant_id} className='hover:bg-muted/30'>
            {COLUMNS.map((c) => {
              const fieldValue = p[c.field];

              return (
                <TableCell key={c.field} className='text-left'>
                  {c.render ? c.render(fieldValue) : fieldValue}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    );
  }

  function renderSkeleton() {
    return (
      <div className='flex flex-col gap-2 rounded-md border border-border p-4'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className='h-10 w-full' />
        ))}
      </div>
    );
  }
}
