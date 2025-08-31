import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { Home } from 'lucide-react';
import AccessibleIcon from '../AccessibleIcon';

describe('AccessibleIcon', () => {
  it('applies aria-label and title', () => {
    render(
      <AccessibleIcon label="Inicio">
        <Home />
      </AccessibleIcon>
    );

    const icon = screen.getByLabelText('Inicio');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('title', 'Inicio');
  });
});

