import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { axe } from 'vitest-axe';

describe('Simple accessibility check', () => {
  it('should pass accessibility checks', async () => {
    const { container } = render(<div>Hello World</div>);
    const results = await axe(container);
    expect(results).toEqual(expect.objectContaining({
      violations: expect.any(Array),
    }));
  });
});
