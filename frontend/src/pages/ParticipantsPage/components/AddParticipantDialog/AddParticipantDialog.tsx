import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BackendFieldError, type CreateParticipantDto, createParticipantSchema } from '@/schemas/participantSchema';

interface IAddParticipantDialog {
  isOpen: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateParticipantDto) => Promise<BackendFieldError[] | null>;
}

export function AddParticipantDialog({ isOpen, isSubmitting, onOpenChange, onSubmit }: IAddParticipantDialog) {
  const form = useForm<CreateParticipantDto>({
    resolver: zodResolver(createParticipantSchema),
    defaultValues: {
      subject_id: '',
      study_group: 'treatment',
      enrollment_date: new Date().toISOString().split('T')[0],
      status: 'active',
      age: undefined,
      gender: 'M',
    },
  });

  async function handleSubmit(data: CreateParticipantDto) {
    const errors = await onSubmit(data);
    if (errors) {
      errors.forEach(({ field, error }) => {
        form.setError(field as keyof CreateParticipantDto, { message: error });
      });
      return;
    }
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size='sm' className='gap-2'>
          <Plus className='h-4 w-4' />
          Add Participant
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        {renderDialogHeader()}
        {renderForm()}
      </DialogContent>
    </Dialog>
  );

  function renderDialogHeader() {
    return (
      <DialogHeader>
        <DialogTitle>Add Participant</DialogTitle>
      </DialogHeader>
    );
  }

  function renderForm() {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-4'>
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='subject_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject ID</FormLabel>
                  <FormControl>
                    <Input placeholder='P001' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='age'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input type='number' placeholder='45' {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='study_group'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Study Group</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='treatment'>Treatment</SelectItem>
                      <SelectItem value='control'>Control</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='gender'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='M'>Male</SelectItem>
                      <SelectItem value='F'>Female</SelectItem>
                      <SelectItem value='Other'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='active'>Active</SelectItem>
                      <SelectItem value='completed'>Completed</SelectItem>
                      <SelectItem value='withdrawn'>Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='enrollment_date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enrollment Date</FormLabel>
                  <FormControl>
                    <Input type='date' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type='submit' disabled={isSubmitting} className='mt-2 w-full'>
            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Add Participant
          </Button>
        </form>
      </Form>
    );
  }
}
