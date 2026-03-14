import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  snapshotDir: './tests/visual/__snapshots__',
  snapshotPathTemplate: '{snapshotDir}/{testFilePath}/{arg}-{projectName}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: process.env.VISUAL_BASE_URL || 'http://localhost:8080',
    screenshot: 'only-on-failure',
    // UDS docs pages respect prefers-reduced-motion: reduce via
    // @media queries that zero out all animation/transition durations.
    // This gives Playwright deterministic full-page screenshots.
    reducedMotion: 'reduce',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.VISUAL_BASE_URL
    ? undefined
    : {
        command: 'npx http-server docs -p 8080 -c-1',
        port: 8080,
        reuseExistingServer: !process.env.CI,
      },
});
