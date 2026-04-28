import { api } from '@/api/api';
import { useLogoutMutation } from '@/api/authApi';
import { logout, setCredentials } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export function useAuth() {
  const dispatch = useAppDispatch();
  const username = useAppSelector((s) => s.auth.username);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [logoutMutation] = useLogoutMutation();

  function authenticate(username: string) {
    dispatch(setCredentials({ username }));
  }

  async function signOut() {
    await logoutMutation();
    dispatch(logout());
    dispatch(api.util.resetApiState());
  }

  return {
    username,
    isAuthenticated,
    authenticate,
    signOut,
  };
}
