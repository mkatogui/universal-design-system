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
        // Wait for fonts to fully load
        await p.evaluate(() => document.fonts.ready);
        // Freeze all animations and transitions to prevent layout shifts
        await p.addStyleTag({
          content: '*, *::before, *::after { animation: none !important; transition: none !important; }',
        });
        // Force sidebar accordion groups to a stable collapsed state (docs.html IntersectionObserver causes height flicker)
        await p.evaluate(() => {
          document.querySelectorAll('.section-group').forEach((el) => {
            el.classList.add('collapsed');
            (el as HTMLElement).style.maxHeight = '0';
          });
        });
        await p.waitForTimeout(300);
        await expect(p).toHaveScreenshot(`${page.name}-${palette}-${mode}.png`, {
          fullPage: true,
          maxDiffPixelRatio: 0.01,
        });
      });
    }
  }
}
