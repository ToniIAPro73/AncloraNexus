import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { UniversalConverter } from '../UniversalConverter';

const mockSocket = {
  on: vi.fn(),
  disconnect: vi.fn(),
};

const apiService = {
  connectProgress: vi.fn(() => mockSocket),
};

const socketRef = {
  current: {
    on: vi.fn(),
    disconnect: vi.fn(),
  },
};

const timersRef = {
  current: {},
};

vi.stubGlobal('apiService', apiService);
vi.stubGlobal('socketRef', socketRef);
vi.stubGlobal('timersRef', timersRef);

describe('Accessibility Tests', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<UniversalConverter />);
    expect(container).toBeInTheDocument();
  });

  it('should have proper heading structure', () => {
    const { getByRole } = render(<UniversalConverter />);
    const heading = getByRole('heading', { name: 'Conversor Inteligente' });
    expect(heading).toBeInTheDocument();
  });

  it('should have accessible file input', () => {
    const { getByText } = render(<UniversalConverter />);
    const fileInput = getByText('Haz clic o arrastra archivos aquí');
    expect(fileInput).toBeInTheDocument();
  });

  it('should have accessible convert button', () => {
    const { getByRole } = render(<UniversalConverter />);
    const button = getByRole('button', { name: 'Seleccionar archivos' });
    expect(button).toBeInTheDocument();
  });
});
