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
  { name: 'case-studies', path: 'docs/case-studies.html' },
  { name: 'playground', path: 'docs/playground.html' },
  { name: 'conformance', path: 'docs/conformance.html' },
];

export default defineConfig({
  testDir: 'tests/visual',
  outputDir: 'tests/visual/results',
  snapshotDir: 'tests/visual/snapshots',
  timeout: 30000,
  retries: 0,
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.001,
      animations: 'disabled',
    },
  },
  use: {
    screenshot: 'off',
  },
  projects: [
    // Desktop viewports
    {
      name: 'desktop-light',
      use: {
        browserName: 'chromium',
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'desktop-dark',
      use: {
        browserName: 'chromium',
        viewport: { width: 1440, height: 900 },
        colorScheme: 'dark',
      },
    },
    // Tablet viewports
    {
      name: 'tablet-light',
      use: {
        browserName: 'chromium',
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'tablet-dark',
      use: {
        browserName: 'chromium',
        viewport: { width: 768, height: 1024 },
        colorScheme: 'dark',
      },
    },
    // Mobile viewports
    {
      name: 'mobile-light',
      use: {
        browserName: 'chromium',
        viewport: { width: 375, height: 812 },
      },
    },
    {
      name: 'mobile-dark',
      use: {
        browserName: 'chromium',
        viewport: { width: 375, height: 812 },
        colorScheme: 'dark',
      },
    },
  ],
});

export { PALETTES, PAGES };
