import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { InteractiveConversions } from '../InteractiveConversions';

describe('InteractiveConversions', () => {
  it('renders category links to /app', () => {
    render(<InteractiveConversions />);
    const link = screen.getByRole('link', { name: /Documentos/i });
    expect(link).toHaveAttribute('href', '/app?category=document');
  });
});

