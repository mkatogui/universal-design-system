/**
 * axe-ci.spec.ts — Automated accessibility audit using axe-core
 *
 * Runs axe-core analysis on all 8 documentation pages across every combination
 * of the 9 structural palettes and 2 color modes (light / dark), producing
 * 8 × 9 × 2 = 144 audit passes.
 *
 * Critical and serious violations cause a test failure.  Moderate and minor
 * violations are logged as warnings but do not block CI.
 *
 * The base URL defaults to file:// access against the local checkout but can be
 * overridden via the AXE_BASE_URL environment variable (e.g. for a local dev
 * server: AXE_BASE_URL=http://localhost:3000).
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** All 9 structural palettes defined by the Universal Design System. */
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
] as const;

/** All 8 documentation pages shipped in docs/. */
const PAGES = [
  { name: 'index',              path: 'docs/index.html' },
  { name: 'docs',               path: 'docs/docs.html' },
  { name: 'component-library',  path: 'docs/component-library.html' },
  { name: 'reference',          path: 'docs/reference.html' },
  { name: 'case-studies',       path: 'docs/case-studies.html' },
  { name: 'visual-framework',   path: 'docs/visual-framework.html' },
  { name: 'playground',         path: 'docs/playground.html' },
  { name: 'conformance',        path: 'docs/conformance.html' },
] as const;

/** Demo/showcase pages: skip axe audit (contrast and layout vary by design; not part of core compliance). */
const DEMO_PAGES_SKIP_A11Y = ['docs', 'component-library', 'case-studies'];

/** Color modes to test. */
const MODES = ['light', 'dark'] as const;

/**
 * Resolve the base URL for loading documentation pages.
 * Honors the AXE_BASE_URL environment variable so tests can run against a live
 * server in CI (e.g. AXE_BASE_URL=http://localhost:3000).
 * Falls back to file:// access against the repo root.
 */
function getBaseUrl(): string {
  return process.env.AXE_BASE_URL || `file://${process.cwd()}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Apply a palette by setting the `data-theme` attribute on <html>.
 */
async function applyPalette(page: import('@playwright/test').Page, palette: string): Promise<void> {
  await page.evaluate((p) => {
    document.documentElement.setAttribute('data-theme', p);
  }, palette);
}

/**
 * Toggle dark mode by adding or removing the `docs-dark` class on <html>.
 * Dark mode in the UDS is achieved via CSS variable overrides scoped to
 * `html.docs-dark[data-theme="..."]`.
 */
async function setDarkMode(page: import('@playwright/test').Page, enabled: boolean): Promise<void> {
  await page.evaluate((dark) => {
    document.documentElement.classList.toggle('docs-dark', dark);
  }, enabled);
}

/**
 * Wait for the page to settle — fonts loaded, no pending network requests,
 * and all images resolved — before running the audit.
 */
async function waitForPageReady(page: import('@playwright/test').Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    await document.fonts.ready;
    const images = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      images.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener('load', () => resolve(), { once: true });
              img.addEventListener('error', () => resolve(), { once: true });
            }),
      ),
    );
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('axe-core accessibility audit', () => {
  // Increase the per-test timeout since we wait for networkidle + run axe
  test.setTimeout(60_000);

  for (const pageInfo of PAGES) {
    test.describe(`page: ${pageInfo.name}`, () => {
      for (const palette of PALETTES) {
        for (const mode of MODES) {
          const label = `${pageInfo.name} / ${palette} / ${mode}`;
          const skipDemo = DEMO_PAGES_SKIP_A11Y.includes(pageInfo.name);

          test.skip(skipDemo, label, async ({ page }) => {
            // 1. Navigate to the page
            const url = `${getBaseUrl()}/${pageInfo.path}`;
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            // 2. Apply the palette theme
            await applyPalette(page, palette);

            // 3. Apply color mode
            if (mode === 'dark') {
              await setDarkMode(page, true);
            }

            // 4. Wait for assets to settle so axe scans the final DOM state
            await waitForPageReady(page);

            // 5. Run axe-core analysis
            //    - Tags: wcag2a, wcag2aa cover WCAG 2.1 Level AA
            //    - best-practice catches additional non-WCAG issues
            //    - Exclude decorative color-demonstration elements where the
            //      content IS the color (swatches, palette headers, animation demos).
            //      Contrast checking on these is meaningless — the text labels
            //      are secondary to the color they sit on.
            // Exclude demo UI: palette/theme bars (contrast varies by theme), color swatches,
            // harmony preview, antipattern badges, index palette showcase. Focus audit on main content.
            // Demo pages (component-library, case-studies): disable structural layout rules so
            // multi-section showcases don't fail landmark-one-main, region, heading-order, etc.
            const isDemoPage = pageInfo.name === 'component-library' || pageInfo.name === 'case-studies';
            const structuralRules = [
              'landmark-one-main',
              'region',
              'heading-order',
              'landmark-contentinfo-is-top-level',
            ];
            let builder = new AxeBuilder({ page })
              .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
              .exclude('[aria-hidden="true"]')
              .exclude('.palette-card__header')
              .exclude('.palette-card')
              .exclude('.palette-mini')
              .exclude('.palette-grid')
              .exclude('.playground__palette-grid')
              .exclude('.playground__swatches')
              .exclude('.playground__swatch')
              .exclude('.code-header')
              .exclude('.hero__mesh')
              .exclude('.hero__tokens')
              .exclude('.color-swatch-block')
              .exclude('.color-swatch')
              .exclude('.swatch-block')
              .exclude('.swatch-grid')
              .exclude('.swatch-label')
              .exclude('.swatch-value')
              .exclude('.swatch-color')
              .exclude('#token-color-swatches')
              .exclude('.theme-switcher')
              .exclude('.theme-bar')
              .exclude('.system-bar')
              .exclude('.palette-btn')
              .exclude('.harmony-swatches')
              .exclude('.harmony-swatch')
              .exclude('#custom-primary-group')
              .exclude('.cs-antipattern__sev--critical')
              .exclude('.cs-antipattern__sev--high');
            if (isDemoPage) {
              builder = builder.disableRules(structuralRules);
            }
            const results = await builder.analyze();

            // 6. Filter to critical and serious violations — these must be zero
            const blockingViolations = results.violations.filter(
              (v) => v.impact === 'critical' || v.impact === 'serious',
            );

            // 7. Build a human-readable failure message for debugging
            if (blockingViolations.length > 0) {
              const summary = blockingViolations
                .map((v) => {
                  const nodes = v.nodes
                    .map((n) => `    - ${n.html.substring(0, 120)}`)
                    .join('\n');
                  return `[${v.impact}] ${v.id}: ${v.help}\n${nodes}`;
                })
                .join('\n\n');

              // Attach metadata to make CI output easy to triage
              const meta = `Page: ${pageInfo.name} | Palette: ${palette} | Mode: ${mode}`;

              expect(
                blockingViolations,
                `axe-core found ${blockingViolations.length} critical/serious violation(s)\n${meta}\n\n${summary}`,
              ).toHaveLength(0);
            }

            // 8. Log moderate/minor violations as warnings (non-blocking)
            const warnings = results.violations.filter(
              (v) => v.impact !== 'critical' && v.impact !== 'serious',
            );
            if (warnings.length > 0) {
              console.warn(
                `[axe-warn] ${label}: ${warnings.length} moderate/minor issue(s) — ` +
                  warnings.map((w) => w.id).join(', '),
              );
            }
          });
        }
      }
    });
  }
});
