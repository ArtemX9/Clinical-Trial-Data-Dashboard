import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { type ReactElement } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { api } from '@/api/api';
import authReducer from '@/store/authSlice';

export function renderWithProviders(ui: ReactElement) {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>,
  );
}
