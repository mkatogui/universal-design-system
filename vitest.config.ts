import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/components/**/*.test.tsx'],
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'json-summary', 'text'],
      reportsDirectory: 'coverage',
      include: ['packages/react/src/components/**/*.tsx', 'cli/src/**/*.ts'],
    },
  },
});
