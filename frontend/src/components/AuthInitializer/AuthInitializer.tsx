import { useEffect } from 'react';

import { useGetMeQuery } from '@/api/authApi';
import { useAuth } from '@/hooks/useAuth';

interface IAuthInitializer {
  children: React.ReactNode;
}

export function AuthInitializer({ children }: IAuthInitializer) {
  const { authenticate, isAuthenticated } = useAuth();
  const { data, isSuccess, isLoading } = useGetMeQuery(undefined, {
    skip: isAuthenticated,
  });

  useEffect(
    function hydrateAuthFromCookie() {
      if (isSuccess && data) {
        authenticate(data.username);
      }
    },
    [isSuccess, data],
  );

  if (!isAuthenticated && (isLoading || isSuccess)) {
    return null;
  }

  return <>{children}</>;
}
