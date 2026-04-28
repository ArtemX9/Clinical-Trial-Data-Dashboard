import { zodResolver } from '@hookform/resolvers/zod';
import { ActivitySquare, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useLoginMutation } from '@/api/authApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/pages/routes';
import { type LoginFormData, loginSchema } from '@/schemas/authSchema';

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, authenticate } = useAuth();
  const [login, { isLoading, error }] = useLoginMutation();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  useEffect(
    function redirectIfAuthenticated() {
      if (isAuthenticated) {
        navigate(ROUTES.participants, { replace: true });
      }
    },
    [isAuthenticated, navigate],
  );

  async function handleSubmit(data: LoginFormData) {
    try {
      const result = await login(data).unwrap();
      authenticate(result.username);
    } catch {
      // error state handled via RTK mutation error
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-muted/40'>
      <Card className='w-full max-w-sm shadow-sm'>
        {renderHeader()}
        {renderForm()}
      </Card>
    </div>
  );

  function renderHeader() {
    return (
      <CardHeader className='text-center'>
        <div className='mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
          <ActivitySquare className='h-5 w-5 text-primary' />
        </div>
        <CardTitle className='text-xl'>Clinical Trial Dashboard</CardTitle>
        <CardDescription>Sign in to access the research portal</CardDescription>
      </CardHeader>
    );
  }

  function renderForm() {
    return (
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-4'>
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter username' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='Enter password' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className='text-sm text-destructive'>Invalid username or password.</p>}
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Sign in
            </Button>
          </form>
        </Form>
      </CardContent>
    );
  }
}
