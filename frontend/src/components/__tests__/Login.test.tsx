import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { Login } from '../Login';

vi.mock('../../services/authService', () => ({
  AuthService: {
    getInstance: () => ({
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
    }),
  },
}), { virtual: true });

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
describe('Login forgot password flow', () => {
  it('redirects to forgot password page', () => {
    render(<Login />);
    fireEvent.click(screen.getByRole('button', { name: '¿Olvidaste tu contraseña?' }));
    expect((window.location as any).assign).toHaveBeenCalledWith('/forgot-password');
  });
});
