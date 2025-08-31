import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { Features } from '../Features';

describe('Features Component', () => {
  it('renders all three feature cards', () => {
    render(<Features onStartConverting={() => {}} />);
    expect(screen.getByText('fÃ¡cil')).toBeInTheDocument();
    expect(screen.getByText('seguro')).toBeInTheDocument();
    expect(screen.getByText('ilimitado')).toBeInTheDocument();
  });

  it('calls onStartConverting when the button is clicked', () => {
    const handleClick = vi.fn();
    render(<Features onStartConverting={handleClick} />);
    const button = screen.getByRole('button', { name: /Comienza a convertir/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

