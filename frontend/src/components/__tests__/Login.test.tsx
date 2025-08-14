import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi, describe, it, expect } from 'vitest';
import { Login } from '../Login';

const mockRequestPasswordReset = vi.fn().mockResolvedValue({ success: true });

vi.mock('../../services/authService', () => ({
  AuthService: { getInstance: () => ({ requestPasswordReset: mockRequestPasswordReset }) },
}));

describe('Login component', () => {
  it('opens password reset modal when clicking forgot password', () => {
    render(<Login />);
    const forgot = screen.getAllByText('¿Olvidaste tu contraseña?')[0];
    fireEvent.click(forgot);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('sends email to request password reset', async () => {
    render(<Login />);
    const forgot = screen.getAllByText('¿Olvidaste tu contraseña?')[0];
    fireEvent.click(forgot);
    const input = screen.getByLabelText(/correo/i);
    fireEvent.change(input, { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar correo/i }));
    await waitFor(() => expect(mockRequestPasswordReset).toHaveBeenCalledWith('user@example.com'));
  });
});
