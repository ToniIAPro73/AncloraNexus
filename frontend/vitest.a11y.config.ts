import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['../tests/vitest-a11y-setup.ts'],
    include: ['**/*.a11y.test.{ts,tsx}'],
    reporters: ['verbose', 'html'],
    outputFile: {
      html: './test-results/a11y-report.html'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
})