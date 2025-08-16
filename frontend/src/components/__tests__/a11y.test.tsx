import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { axe } from 'vitest-axe';
import { toHaveNoViolations } from 'vitest-axe/matchers';

import { Features } from '../Features';
import { FAQ } from '../FAQ';

expect.extend({ toHaveNoViolations });

describe('Accessibility checks', () => {
  it('Features section has no accessibility violations', async () => {
    const { container } = render(<Features onStartConverting={() => {}} />);
    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('FAQ section has no accessibility violations', async () => {
    const { container } = render(<FAQ />);
    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
