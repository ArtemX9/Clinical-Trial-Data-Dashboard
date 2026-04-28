import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthInitializer } from '@/components/AuthInitializer/AuthInitializer';
import { ProtectedRoute } from '@/components/ProtectedRoute/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage/LoginPage';
import { MetricsPageContainer } from '@/pages/MetricsPage/MetricsPageContainer';
import { ParticipantsPageContainer } from '@/pages/ParticipantsPage/ParticipantsPageContainer';
import { ROUTES } from '@/pages/routes';

function App() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <Routes>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.participants} element={<ParticipantsPageContainer />} />
            <Route path={ROUTES.metrics} element={<MetricsPageContainer />} />
            <Route path={ROUTES.main} element={<Navigate to={ROUTES.participants} replace />} />
          </Route>
          <Route path={ROUTES.any} element={<Navigate to={ROUTES.main} replace />} />
        </Routes>
      </AuthInitializer>
    </BrowserRouter>
  );
}

export default App;
