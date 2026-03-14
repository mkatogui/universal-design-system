import { test, expect } from '@playwright/test';

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
const MODES = ['light', 'dark'];
const PAGES = [
  { name: 'index', path: '/' },
  { name: 'docs', path: '/docs.html' },
  { name: 'component-library', path: '/component-library.html' },
  { name: 'reference', path: '/reference.html' },
  { name: 'visual-framework', path: '/visual-framework.html' },
  { name: 'case-studies', path: '/case-studies.html' },
  { name: 'playground', path: '/playground.html' },
  { name: 'conformance', path: '/conformance.html' },
];

for (const page of PAGES) {
  for (const palette of PALETTES) {
    for (const mode of MODES) {
      test(`visual / ${page.name} / ${palette} / ${mode}`, async ({ page: p }) => {
        await p.goto(page.path);
        // Apply palette and mode
        await p.evaluate(
          ({ palette, mode }) => {
            document.documentElement.setAttribute('data-theme', palette);
            if (mode === 'dark') {
              document.documentElement.classList.add('docs-dark');
            } else {
              document.documentElement.classList.remove('docs-dark');
            }
          },
          { palette, mode },
        );
        // Wait for web fonts — the config sets reducedMotion: 'reduce'
        // which activates the docs pages' @media (prefers-reduced-motion: reduce)
        // block, zeroing all animation/transition durations automatically.
        await p.evaluate(() => document.fonts.ready);
        await p.waitForTimeout(200);
        await expect(p).toHaveScreenshot(`${page.name}-${palette}-${mode}.png`, {
          fullPage: true,
          maxDiffPixelRatio: 0.01,
        });
      });
    }
  }
}
