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

          test(label, async ({ page }) => {
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
            const results = await new AxeBuilder({ page })
              .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
              .analyze();

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
