import { Navigate, Outlet } from 'react-router-dom';

import { Layout } from '@/components/Layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/pages/routes';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
