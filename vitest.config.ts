import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: resolve(__dirname, 'node_modules/react'),
      'react-dom': resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/components/**/*.test.{ts,tsx}', 'tests/cli/**/*.test.ts'],
    environmentMatchGlobs: [['tests/cli/**', 'node']],
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'json-summary', 'text'],
      reportsDirectory: 'coverage',
      include: [
        'packages/react/src/components/**/*.tsx',
        'packages/react/src/utils/**/*.ts',
        'cli/src/**/*.ts',
      ],
      thresholds: {
        lines: 35,
        functions: 35,
        branches: 30,
        statements: 35,
      },
    },
  },
});
