// Vitest configuration for accessibility testing
// This configuration is meant to be run from the frontend directory
// with: npm run test:a11y -- --config ../vitest.a11y.config.ts

export default {
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest-a11y-setup.ts'],
    include: ['**/*.a11y.test.{ts,tsx}'],
    reporters: ['verbose'],
  },
}