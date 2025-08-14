import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UniversalConverter } from '../UniversalConverter';

describe('UniversalConverter actions', () => {
  it('cancels a queued item', () => {
    vi.useFakeTimers();
    const { container } = render(<UniversalConverter />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['content'], 'file1.txt', { type: 'text/plain' });

    fireEvent.change(input, { target: { files: [file] } });
    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelBtn);

    expect(screen.getByText('Cancelado')).toBeInTheDocument();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('reorders items with up button', () => {
    vi.useFakeTimers();
    const { container } = render(<UniversalConverter />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file1 = new File(['a'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['b'], 'file2.txt', { type: 'text/plain' });

    fireEvent.change(input, { target: { files: [file1, file2] } });

    const upButtons = screen.getAllByText('↑');
    fireEvent.click(upButtons[1]);

    const names = screen.getAllByText(/file[12]\.txt/).map(el => el.textContent);
    expect(names[0]).toBe('file2.txt');
    expect(names[1]).toBe('file1.txt');

    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });
});

