import { test, expect } from '@playwright/test';
import * as path from 'path';

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

const MODES = ['light', 'dark'] as const;

const ROOT = path.resolve(__dirname, '..', '..');

for (const page of PAGES) {
  for (const palette of PALETTES) {
    for (const mode of MODES) {
      test(`${page.name} - ${palette} - ${mode}`, async ({ page: browserPage }) => {
        const filePath = path.join(ROOT, page.path);
        await browserPage.goto(`file://${filePath}`, { waitUntil: 'domcontentloaded' });

        // Set palette
        await browserPage.evaluate((p) => {
          document.documentElement.setAttribute('data-theme', p);
        }, palette);

        // Set dark mode
        if (mode === 'dark') {
          await browserPage.evaluate(() => {
            document.documentElement.classList.add('docs-dark');
          });
        } else {
          await browserPage.evaluate(() => {
            document.documentElement.classList.remove('docs-dark');
          });
        }

        // Wait for fonts and transitions
        await browserPage.waitForTimeout(500);

        // Take screenshot and compare
        const screenshotName = `${page.name}-${palette}-${mode}.png`;
        await expect(browserPage).toHaveScreenshot(screenshotName, {
          fullPage: true,
          maxDiffPixelRatio: 0.01,
        });
      });
    }
  }
}
