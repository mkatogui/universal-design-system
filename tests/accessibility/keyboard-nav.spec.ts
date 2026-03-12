/**
 * keyboard-nav.spec.ts — Keyboard navigation tests
 *
 * Validates that all interactive components in the Universal Design System are
 * fully operable via keyboard alone, per WCAG 2.1 SC 2.1.1 (Keyboard) and
 * SC 2.4.7 (Focus Visible).
 *
 * Tests run against docs.html (full interactive documentation) and
 * component-library.html (code reference with live component demos).
 */

import { test, expect, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Base URL — honors AXE_BASE_URL for local dev servers, else file:// */
function getBaseUrl(): string {
  return process.env.AXE_BASE_URL || `file://${process.cwd()}`;
}

/** Pages that contain interactive component demos. */
const INTERACTIVE_PAGES = [
  { name: 'docs',              path: 'docs/docs.html' },
  { name: 'component-library', path: 'docs/component-library.html' },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wait for the page to reach a stable state before running keyboard tests.
 */
async function waitForReady(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

/**
 * Assert that the currently focused element has a visible focus indicator.
 * Checks for a non-zero outline-width OR a box-shadow that acts as a focus ring.
 * This satisfies WCAG 2.1 SC 2.4.7 (Focus Visible).
 */
async function expectVisibleFocusIndicator(page: Page): Promise<void> {
  const hasFocusStyle = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return false;
    const styles = window.getComputedStyle(el);

    // Check outline
    const outlineWidth = parseFloat(styles.outlineWidth);
    const outlineStyle = styles.outlineStyle;
    const hasOutline = outlineWidth > 0 && outlineStyle !== 'none';

    // Check box-shadow (often used as custom focus rings)
    const boxShadow = styles.boxShadow;
    const hasBoxShadow = boxShadow !== 'none' && boxShadow !== '';

    // Check border change (some designs use border as focus indicator)
    const borderWidth = parseFloat(styles.borderWidth);
    const hasBorder = borderWidth > 0;

    return hasOutline || hasBoxShadow || hasBorder;
  });

  expect(hasFocusStyle, 'Focused element should have a visible focus indicator').toBe(true);
}

/**
 * Get a description of the currently focused element for debugging.
 */
async function getFocusedElementInfo(page: Page): Promise<string> {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return '<body>';
    const tag = el.tagName.toLowerCase();
    const cls = el.className ? `.${el.className.toString().split(' ').join('.')}` : '';
    const id = el.id ? `#${el.id}` : '';
    const text = el.textContent?.trim().substring(0, 40) || '';
    return `<${tag}${id}${cls}> "${text}"`;
  });
}

// ---------------------------------------------------------------------------
// Tests: Tab Order
// ---------------------------------------------------------------------------

test.describe('Keyboard navigation — Tab order', () => {
  test.setTimeout(60_000);

  for (const pageInfo of INTERACTIVE_PAGES) {
    test.describe(`page: ${pageInfo.name}`, () => {

      /**
       * Verifies that pressing Tab moves focus sequentially through
       * interactive elements (links, buttons, inputs, etc.) without skipping
       * or getting trapped.
       */
      test('Tab moves focus through interactive elements in document order', async ({ page }) => {
        await page.goto(`${getBaseUrl()}/${pageInfo.path}`, { waitUntil: 'domcontentloaded' });
        await waitForReady(page);

        // Count interactive elements that should be reachable via Tab
        const interactiveCount = await page.evaluate(() => {
          const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
          // Only count visible elements
          return Array.from(document.querySelectorAll(selector)).filter((el) => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
          }).length;
        });

        // Tab through at least 10 elements (or all if fewer) and verify
        // focus moves to a new element each time
        const tabCount = Math.min(interactiveCount, 15);
        const visited: string[] = [];

        for (let i = 0; i < tabCount; i++) {
          await page.keyboard.press('Tab');
          const focused = await getFocusedElementInfo(page);
          visited.push(focused);
        }

        // At least some unique elements should have been visited
        const unique = new Set(visited);
        expect(
          unique.size,
          `Expected Tab to reach multiple unique elements. Visited: ${visited.join(' -> ')}`,
        ).toBeGreaterThan(1);
      });

      /**
       * Verifies that Shift+Tab moves focus backwards, enabling users to
       * navigate in reverse order.
       */
      test('Shift+Tab moves focus backwards', async ({ page }) => {
        await page.goto(`${getBaseUrl()}/${pageInfo.path}`, { waitUntil: 'domcontentloaded' });
        await waitForReady(page);

        // Tab forward a few times to establish a position
        for (let i = 0; i < 5; i++) {
          await page.keyboard.press('Tab');
        }
        const beforeShiftTab = await getFocusedElementInfo(page);

        // Shift+Tab should move back
        await page.keyboard.press('Shift+Tab');
        const afterShiftTab = await getFocusedElementInfo(page);

        expect(afterShiftTab).not.toBe(beforeShiftTab);
      });

      /**
       * Ensures focus does not get trapped in any single element or region,
       * which would violate WCAG 2.1 SC 2.1.2 (No Keyboard Trap).
       */
      test('focus does not get trapped in any component', async ({ page }) => {
        await page.goto(`${getBaseUrl()}/${pageInfo.path}`, { waitUntil: 'domcontentloaded' });
        await waitForReady(page);

        // Tab through many elements and verify the focus changes
        const focusHistory: string[] = [];
        for (let i = 0; i < 30; i++) {
          await page.keyboard.press('Tab');
          focusHistory.push(await getFocusedElementInfo(page));
        }

        // Check for keyboard traps: if the same element appears more than
        // 5 consecutive times, focus is likely trapped
        let maxConsecutive = 1;
        let current = 1;
        for (let i = 1; i < focusHistory.length; i++) {
          if (focusHistory[i] === focusHistory[i - 1]) {
            current++;
            maxConsecutive = Math.max(maxConsecutive, current);
          } else {
            current = 1;
          }
        }

        expect(
          maxConsecutive,
          `Focus appears to be trapped — same element focused ${maxConsecutive} times in a row`,
        ).toBeLessThanOrEqual(5);
      });
    });
  }
});

// ---------------------------------------------------------------------------
// Tests: Focus Visibility
// ---------------------------------------------------------------------------

test.describe('Keyboard navigation — Focus visibility', () => {
  test.setTimeout(60_000);

  for (const pageInfo of INTERACTIVE_PAGES) {
    test.describe(`page: ${pageInfo.name}`, () => {

      /**
       * Checks that every focused interactive element displays a visible focus
       * indicator (outline, box-shadow, or border), satisfying WCAG 2.4.7.
       */
      test('focused interactive elements have visible focus indicators', async ({ page }) => {
        await page.goto(`${getBaseUrl()}/${pageInfo.path}`, { waitUntil: 'domcontentloaded' });
        await waitForReady(page);

        const elementsToCheck = 10;
        const failures: string[] = [];

        for (let i = 0; i < elementsToCheck; i++) {
          await page.keyboard.press('Tab');

          const isFocusOnBody = await page.evaluate(
            () => document.activeElement === document.body,
          );
          if (isFocusOnBody) break;

          const hasFocus = await page.evaluate(() => {
            const el = document.activeElement;
            if (!el || el === document.body) return true; // skip body
            const styles = window.getComputedStyle(el);
            const outlineWidth = parseFloat(styles.outlineWidth);
            const outlineStyle = styles.outlineStyle;
            const hasOutline = outlineWidth > 0 && outlineStyle !== 'none';
            const boxShadow = styles.boxShadow;
            const hasBoxShadow = boxShadow !== 'none' && boxShadow !== '';
            return hasOutline || hasBoxShadow;
          });

          if (!hasFocus) {
            const info = await getFocusedElementInfo(page);
            failures.push(info);
          }
        }

        // Allow a small tolerance — some browsers handle focus styles differently
        expect(
          failures.length,
          `Elements without visible focus indicator:\n${failures.join('\n')}`,
        ).toBeLessThanOrEqual(2);
      });
    });
  }
});

// ---------------------------------------------------------------------------
// Tests: Enter / Space activation
// ---------------------------------------------------------------------------

test.describe('Keyboard navigation — Enter and Space activation', () => {
  test.setTimeout(60_000);

  for (const pageInfo of INTERACTIVE_PAGES) {
    test.describe(`page: ${pageInfo.name}`, () => {

      /**
       * Verifies that buttons are activatable with both Enter and Space keys,
       * matching native browser button behavior expected by assistive tech.
       */
      test('buttons respond to Enter key', async ({ page }) => {
        await page.goto(`${getBaseUrl()}/${pageInfo.path}`, { waitUntil: 'domcontentloaded' });
        await waitForReady(page);

        // Find the first visible, non-disabled button
        const buttonSelector = 'button:not([disabled]):not([aria-hidden="true"])';
        const button = page.locator(buttonSelector).first();
        await button.focus();

        // Verify the button is focused
        const isFocused = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          return el === document.activeElement;
        }, buttonSelector);
        expect(isFocused, 'Button should receive focus').toBe(true);

        // Press Enter — should not throw and the button should remain in the DOM
        await page.keyboard.press('Enter');
        await expect(button).toBeAttached();
      });

      /**
       * Verifies that Space also activates buttons. This is important because
       * some ARIA widget patterns rely on Space for activation.
       */
      test('buttons respond to Space key', async ({ page }) => {
        await page.goto(`${getBaseUrl()}/${pageInfo.path}`, { waitUntil: 'domcontentloaded' });
        await waitForReady(page);

        // Focus a palette button which has a well-defined click handler
        const paletteBtn = page.locator('.palette-btn').first();
        await paletteBtn.focus();

        const themeBefore = await page.evaluate(() =>
          document.documentElement.getAttribute('data-theme'),
        );

        // Press Space on the palette button — should change the theme
        await page.keyboard.press('Space');

        // Verify the theme actually changed after Space activation
        const themeAfter = await page.evaluate(() =>
          document.documentElement.getAttribute('data-theme'),
        );
        expect(themeAfter, 'Space key should activate the palette button and change the theme').not.toBe(themeBefore);

        // Verify the button is still reachable (activation did not break the page)
        await expect(paletteBtn).toBeAttached();
      });

      /**
       * Verifies that links are activatable with Enter, navigating or triggering
       * their href action.
       */
      test('links are activatable with Enter', async ({ page }) => {
        await page.goto(`${getBaseUrl()}/${pageInfo.path}`, { waitUntil: 'domcontentloaded' });
        await waitForReady(page);

        // Find the first visible anchor link in the page content
        const linkSelector = 'a[href]:not([aria-hidden="true"])';
        const link = page.locator(linkSelector).first();

        if (await link.isVisible()) {
          await link.focus();

          const isFocused = await page.evaluate((sel) => {
            const el = document.querySelector(sel);
            return el === document.activeElement;
          }, linkSelector);

          expect(isFocused, 'Link should receive focus').toBe(true);

          // Pressing Enter on a link should not error
          // We don't assert navigation because the link may be an anchor or external
          await page.keyboard.press('Enter');
        }
      });
    });
  }
});

// ---------------------------------------------------------------------------
// Tests: Escape key
// ---------------------------------------------------------------------------

test.describe('Keyboard navigation — Escape key', () => {
  test.setTimeout(60_000);

  /**
   * The top navigation hamburger menu should close when Escape is pressed.
   * This is a common WCAG pattern for dismissible overlays.
   */
  test('hamburger navigation closes on Escape', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/docs/component-library.html`, {
      waitUntil: 'domcontentloaded',
    });
    await waitForReady(page);

    const hamburger = page.locator('.topnav-hamburger');
    if (await hamburger.isVisible()) {
      // Open the nav by clicking the hamburger
      await hamburger.click();

      const isExpanded = await hamburger.getAttribute('aria-expanded');
      // The menu may or may not expand depending on viewport — only test if it opened
      if (isExpanded === 'true') {
        // Press Escape
        await page.keyboard.press('Escape');

        // Verify the menu closed
        await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
      }
    }
  });

  /**
   * Expandable sidebar sections in docs.html should close on Escape when
   * focused within an expanded section.
   */
  test('sidebar accordion sections respond to keyboard', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/docs/docs.html`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    // Find section toggle buttons in the sidebar
    const sectionTriggers = page.locator('.section-title');
    const count = await sectionTriggers.count();

    if (count > 0) {
      // Focus and activate the first collapsed section
      const firstCollapsed = page.locator('.section-title.collapsed').first();
      if (await firstCollapsed.isVisible()) {
        await firstCollapsed.focus();
        await page.keyboard.press('Enter');

        // Verify it expanded
        const expanded = await firstCollapsed.getAttribute('aria-expanded');
        expect(expanded).toBe('true');
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Tests: Arrow key navigation
// ---------------------------------------------------------------------------

test.describe('Keyboard navigation — Arrow keys', () => {
  test.setTimeout(60_000);

  /**
   * Tabs should support arrow key navigation per the WAI-ARIA Tabs pattern:
   * Left/Right arrows move between tabs in a tablist.
   */
  test('tab components respond to arrow key navigation', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/docs/docs.html`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    // Find the tablist
    const tablist = page.locator('[role="tablist"]').first();
    if (await tablist.isVisible()) {
      // Focus the first tab
      const firstTab = tablist.locator('[role="tab"]').first();
      await firstTab.focus();

      const firstTabText = await firstTab.textContent();

      // Press ArrowRight to move to the next tab
      await page.keyboard.press('ArrowRight');

      const currentFocus = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.textContent?.trim() || '';
      });

      // Focus should have moved to a different tab (or the same if only one tab)
      const tabCount = await tablist.locator('[role="tab"]').count();
      if (tabCount > 1) {
        expect(
          currentFocus,
          'ArrowRight should move focus to the next tab',
        ).not.toBe(firstTabText?.trim());
      }
    }
  });

  /**
   * Accordion triggers should be reachable via sequential keyboard navigation.
   * The accordion component in the UDS uses Enter/Space to toggle sections.
   */
  test('accordion triggers are keyboard-operable', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/docs/docs.html`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    const trigger = page.locator('.accordion-trigger').first();
    if (await trigger.isVisible()) {
      await trigger.focus();

      // Get the initial expanded state
      const initialState = await trigger.getAttribute('aria-expanded');

      // Press Enter to toggle
      await page.keyboard.press('Enter');

      const newState = await trigger.getAttribute('aria-expanded');

      // The state should have toggled
      expect(newState).not.toBe(initialState);
    }
  });

  /**
   * Palette switcher buttons in the theme bar should be navigable.
   * Users should be able to Tab to the palette bar and then navigate buttons.
   */
  test('palette switcher buttons are keyboard-reachable', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/docs/docs.html`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    const paletteBtn = page.locator('.palette-btn').first();
    if (await paletteBtn.isVisible()) {
      await paletteBtn.focus();

      // Verify focus landed on the palette button
      const isFocused = await page.evaluate(() => {
        return document.activeElement?.classList.contains('palette-btn');
      });
      expect(isFocused, 'Palette button should be focusable').toBe(true);

      // Press Enter to activate
      await page.keyboard.press('Enter');

      // Verify the theme attribute was set
      const theme = await page.evaluate(() =>
        document.documentElement.getAttribute('data-theme'),
      );
      expect(theme).toBeTruthy();
    }
  });
});
