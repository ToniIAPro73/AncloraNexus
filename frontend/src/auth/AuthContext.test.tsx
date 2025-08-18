import React from 'react';
import { render, fireEvent, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../services/api', () => ({
  apiService: {
    login: vi.fn(),
    register: vi.fn(),
    verifyToken: vi.fn().mockResolvedValue({ valid: false, user: null }),
    logout: vi.fn(),
    clearToken: vi.fn(),
    getProfile: vi.fn(),
  }
}));

import { AuthProvider, useAuth } from './AuthContext';
import { apiService } from '../services/api';
import { MemoryRouter } from 'react-router-dom';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function TestComponent() {
  const { login } = useAuth();
  return (
    <button onClick={() => login({ email: 'test@example.com', password: 'pass' })}>
      Login
    </button>
  );
}

describe('AuthContext navigation', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('navigates to /app after successful login', async () => {
    (apiService.login as any).mockResolvedValue({
      user: { id: 1, email: 'test@example.com', full_name: 'Test' },
      token: 'fake',
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/app');
    });
  });
});
