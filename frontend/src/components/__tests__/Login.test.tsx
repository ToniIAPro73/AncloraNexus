import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { Login } from '../Login';
import { apiService } from '../../services/api';

vi.mock('../../services/authService', () => ({
  AuthService: {
    getInstance: () => ({
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      requestPasswordReset: vi.fn(),
    }),
  },
}), { virtual: true });
vi.mock('../../services/api', () => ({
  apiService: {
    requestPasswordReset: vi.fn().mockResolvedValue(undefined),
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
describe('Login forgot password flow', () => {
  it('requests password reset when email provided', async () => {
    window.alert = vi.fn();
    render(<Login />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: '¿Olvidaste tu contraseña?' }));
    await waitFor(() => {
      expect(apiService.requestPasswordReset).toHaveBeenCalledWith('user@example.com');
    });
  });

  it('shows error when email is missing', async () => {
    render(<Login />);
    fireEvent.click(screen.getByRole('button', { name: '¿Olvidaste tu contraseña?' }));
    expect(apiService.requestPasswordReset).not.toHaveBeenCalled();
    expect(screen.getByText('Por favor ingresa tu correo electrónico')).toBeInTheDocument();
  });
});

