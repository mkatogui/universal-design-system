import { defineConfig } from '@playwright/test';

const PALETTES = [
  'minimal-saas',
  'ai-futuristic',
  'gradient-startup',
  'corporate',
  'apple-minimal',
  'illustration',
  'dashboard',
  'bold-lifestyle',
  'minimal-corporate',
];

const PAGES = [
  { name: 'index', path: 'docs/index.html' },
  { name: 'docs', path: 'docs/docs.html' },
  { name: 'component-library', path: 'docs/component-library.html' },
  { name: 'visual-framework', path: 'docs/visual-framework.html' },
  { name: 'reference', path: 'docs/reference.html' },
];

export default defineConfig({
  testDir: 'tests/visual',
  outputDir: 'tests/visual/results',
  snapshotDir: 'tests/visual/snapshots',
  timeout: 30000,
  retries: 0,
  use: {
    viewport: { width: 1280, height: 720 },
    screenshot: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});

export { PALETTES, PAGES };
