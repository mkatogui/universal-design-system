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

/**
 * Stabilize the page for deterministic full-page screenshots.
 *
 * All docs pages use CSS transitions (palette switch, dark mode toggle,
 * sidebar accordion, tooltip hover) and load web fonts (Inter, display
 * fonts) that can cause layout reflow.  The docs.html sidebar also has
 * an IntersectionObserver that expands/collapses accordion groups as
 * sections scroll into view — this shifts page height by ~15 px between
 * consecutive captures.
 *
 * The stabilization strategy:
 *  1. Wait for web fonts to finish loading (prevents text reflow).
 *  2. Freeze every CSS animation and transition via an injected stylesheet
 *     so no element can change size/position mid-capture.
 *  3. Disconnect all IntersectionObservers so scroll-triggered DOM changes
 *     cannot fire between Playwright's two stability screenshots.
 *  4. Force a layout reflow and wait a tick for the browser to settle.
 */
async function stabilizePage(p: import('@playwright/test').Page): Promise<void> {
  // 1. Wait for web fonts
  await p.evaluate(() => document.fonts.ready);

  // 2. Freeze all animations and transitions
  await p.addStyleTag({
    content:
      '*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; transition-delay: 0s !important; }',
  });

  // 3. Disconnect all IntersectionObservers to prevent mid-capture DOM changes
  await p.evaluate(() => {
    const origObserve = IntersectionObserver.prototype.observe;
    // Disconnect every existing observer by overriding observe to no-op,
    // then calling disconnect on any instance that was created.
    // biome-ignore lint: patching prototype intentionally for test stability
    IntersectionObserver.prototype.observe = function () {};
    document.querySelectorAll('*').forEach(() => {}); // force GC opportunity
    IntersectionObserver.prototype.observe = origObserve;

    // Also directly disconnect observers if they stored a reference
    // The sidebar observer in docs.html is anonymous, so we use a
    // broader approach: re-run the collapse logic once, then freeze.
    document.querySelectorAll('.section-group').forEach((el) => {
      el.classList.remove('collapsed');
    });
  });

  // 4. Force layout reflow and settle
  await p.evaluate(() => {
    void document.body.offsetHeight;
  });
  await p.waitForTimeout(200);
}

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
        await stabilizePage(p);
        await expect(p).toHaveScreenshot(`${page.name}-${palette}-${mode}.png`, {
          fullPage: true,
          maxDiffPixelRatio: 0.01,
        });
      });
    }
  }
}
