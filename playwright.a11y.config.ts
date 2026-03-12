import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/accessibility',
  timeout: 60000,
  retries: 0,
  use: {
    browserName: 'chromium',
  },
});
