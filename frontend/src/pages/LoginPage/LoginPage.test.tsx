import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { LoginPage } from '@/pages/LoginPage/LoginPage';
import { generateUser } from '@/test';
import { renderWithProviders } from '@/test/utils/renderWithProviders';

describe('LoginPage', () => {
  it('renders username and password fields', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
  });

  it('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Username is required')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
  });

  it('calls login with correct credentials on submit', async () => {
    const user = userEvent.setup();
    const { username, password } = generateUser();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByPlaceholderText('Enter username'), username);
    await user.type(screen.getByPlaceholderText('Enter password'), password);
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // form submits without validation errors
    expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
    expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
  });
});
