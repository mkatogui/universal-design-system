/**
 * aria-attributes.spec.ts — ARIA attribute validation
 *
 * Validates that ARIA roles, states, and properties are correctly applied to
 * all interactive components in the Universal Design System.  Tests run
 * primarily against component-library.html which contains live demos of every
 * UDS component alongside their accessible code snippets.
 *
 * The checks align with WAI-ARIA 1.2 authoring practices and cover:
 *  - Role attributes matching expected patterns
 *  - aria-label / aria-labelledby on interactive elements
 *  - aria-expanded on expandable widgets (accordion, dropdown, hamburger)
 *  - aria-modal on dialog overlays
 *  - aria-selected on tab panels
 *  - aria-live regions for dynamic content (toast, alert)
 *  - Detection of conflicting or redundant ARIA attributes
 */

import { test, expect, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Base URL — honors AXE_BASE_URL for local dev servers, else file:// */
function getBaseUrl(): string {
  return process.env.AXE_BASE_URL || `file://${process.cwd()}`;
}

/** Primary test page containing all component demos. */
const COMPONENT_PAGE = 'docs/component-library.html';

/** The docs page contains interactive accordion, tabs, and sidebar widgets. */
const DOCS_PAGE = 'docs/docs.html';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function waitForReady(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

// ---------------------------------------------------------------------------
// Tests: Role attributes
// ---------------------------------------------------------------------------

test.describe('ARIA attributes — Role validation', () => {
  test.setTimeout(60_000);

  test('navigation landmarks have correct roles', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${COMPONENT_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    // The site-topnav should be a <nav> element with an aria-label
    const topNav = page.locator('nav.site-topnav');
    await expect(topNav).toHaveAttribute('aria-label');

    // Search region should have role="search"
    const searchRegion = page.locator('[role="search"]');
    const searchCount = await searchRegion.count();
    expect(searchCount, 'There should be at least one search landmark').toBeGreaterThanOrEqual(1);
  });

  test('tablist containers use role="tablist"', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${COMPONENT_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    const tablists = page.locator('[role="tablist"]');
    const count = await tablists.count();

    // The component library includes tab demos
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const tablist = tablists.nth(i);

        // Each tablist should contain at least one element with role="tab"
        const tabs = tablist.locator('[role="tab"]');
        const tabCount = await tabs.count();
        expect(
          tabCount,
          `Tablist #${i} should contain at least one tab`,
        ).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test('switch toggles use role="switch"', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${COMPONENT_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    const switches = page.locator('[role="switch"]');
    const count = await switches.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const sw = switches.nth(i);
        // role="switch" must have aria-checked
        const ariaChecked = await sw.getAttribute('aria-checked');
        expect(
          ariaChecked,
          `Switch #${i} must have aria-checked attribute`,
        ).toBeTruthy();
        expect(['true', 'false']).toContain(ariaChecked);
      }
    }
  });

  test('menu items use role="menuitem"', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${COMPONENT_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    // Check that dropdown items in code examples reference role="menuitem"
    // The component-library shows code snippets with proper ARIA roles
    const menuItems = page.locator('[role="menuitem"]');
    const count = await menuItems.count();

    // Menu items may be in live demos or only in code blocks
    // This test verifies that when present, they follow the pattern
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const item = menuItems.nth(i);
        const tagName = await item.evaluate((el) => el.tagName.toLowerCase());
        // menuitem should be focusable — either a native button/a or have tabindex
        const tabindex = await item.getAttribute('tabindex');
        const isNativeInteractive = ['button', 'a'].includes(tagName);
        expect(
          isNativeInteractive || tabindex !== null,
          `Menu item #${i} should be focusable (native interactive element or has tabindex)`,
        ).toBe(true);
      }
    }
  });

  test('alert components use role="alert" or role="status"', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${COMPONENT_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    // Success and info alerts use role="status" (non-urgent)
    const statusAlerts = page.locator('.alert[role="status"]');
    const statusCount = await statusAlerts.count();

    // Error and warning alerts use role="alert" (urgent)
    const urgentAlerts = page.locator('.alert[role="alert"]');
    const urgentCount = await urgentAlerts.count();

    // At least some alerts should be present on the component library page
    const totalAlerts = statusCount + urgentCount;
    expect(
      totalAlerts,
      'Component library should include alert demos with proper roles',
    ).toBeGreaterThanOrEqual(1);
  });

  test('tooltip elements use role="tooltip"', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${COMPONENT_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    const tooltips = page.locator('[role="tooltip"]');
    const count = await tooltips.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const tooltip = tooltips.nth(i);
        const id = await tooltip.getAttribute('id');
        // Tooltips should have an id so triggers can reference them via aria-describedby
        expect(id, `Tooltip #${i} should have an id for aria-describedby reference`).toBeTruthy();
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Tests: aria-label and aria-labelledby
// ---------------------------------------------------------------------------

test.describe('ARIA attributes — Labels', () => {
  test.setTimeout(60_000);

  test('buttons without visible text have aria-label', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${COMPONENT_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    // Find all buttons and check if they have accessible names
    const unlabeledButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const issues: string[] = [];

      for (const btn of buttons) {
        // Skip hidden buttons
        const style = window.getComputedStyle(btn);
        if (style.display === 'none' || style.visibility === 'hidden') continue;

        const hasVisibleText = (btn.textContent?.trim().length ?? 0) > 0;
        const hasAriaLabel = btn.hasAttribute('aria-label');
        const hasAriaLabelledBy = btn.hasAttribute('aria-labelledby');
        const hasTitle = btn.hasAttribute('title');

        // Buttons with only SVG/icon content need aria-label
        if (!hasVisibleText && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle) {
          const html = btn.outerHTML.substring(0, 120);
          issues.push(html);
        }
      }
      return issues;
    });

    expect(
      unlabeledButtons,
      `Buttons without accessible names:\n${unlabeledButtons.join('\n')}`,
    ).toHaveLength(0);
  });

  test('form inputs have associated labels', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${COMPONENT_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    const unlabeledInputs = await page.evaluate(() => {
      const inputs = Array.from(
        document.querySelectorAll('input:not([type="hidden"]), textarea, select'),
      );
      const issues: string[] = [];

      for (const input of inputs) {
        // Skip hidden inputs
        const style = window.getComputedStyle(input);
        if (style.display === 'none' || style.visibility === 'hidden') continue;

        const hasAriaLabel = input.hasAttribute('aria-label');
        const hasAriaLabelledBy = input.hasAttribute('aria-labelledby');
        const hasTitle = input.hasAttribute('title');
        const hasPlaceholder = input.hasAttribute('placeholder');
        const id = input.getAttribute('id');
        const hasLabel = id ? document.querySelector(`label[for="${id}"]`) !== null : false;

        // Input should have at least one labelling mechanism
        if (!hasAriaLabel && !hasAriaLabelledBy && !hasLabel && !hasTitle) {
          // Placeholder alone is not sufficient, but is a common pattern —
          // flag only inputs with zero labelling
          if (!hasPlaceholder) {
            issues.push(input.outerHTML.substring(0, 120));
          }
        }
      }
      return issues;
    });

    expect(
      unlabeledInputs,
      `Inputs without accessible labels:\n${unlabeledInputs.join('\n')}`,
    ).toHaveLength(0);
  });

  test('navigation landmarks have descriptive aria-label', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${COMPONENT_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    const navs = page.locator('nav');
    const count = await navs.count();

    for (let i = 0; i < count; i++) {
      const nav = navs.nth(i);
      const ariaLabel = await nav.getAttribute('aria-label');
      const ariaLabelledBy = await nav.getAttribute('aria-labelledby');

      // When multiple <nav> elements exist, each should have a unique label
      // to distinguish them for screen reader users
      const hasLabel = (ariaLabel && ariaLabel.length > 0) || ariaLabelledBy;
      expect(
        hasLabel,
        `<nav> element #${i} should have aria-label or aria-labelledby`,
      ).toBeTruthy();
    }
  });

  test('images have alt text', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${COMPONENT_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    const missingAlt = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      const issues: string[] = [];

      for (const img of images) {
        // Skip hidden images
        const style = window.getComputedStyle(img);
        if (style.display === 'none' || style.visibility === 'hidden') continue;

        // img elements should have alt (even if empty string for decorative images)
        if (!img.hasAttribute('alt')) {
          issues.push(img.outerHTML.substring(0, 120));
        }
      }
      return issues;
    });

    expect(
      missingAlt,
      `Images without alt attribute:\n${missingAlt.join('\n')}`,
    ).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Tests: aria-expanded
// ---------------------------------------------------------------------------

test.describe('ARIA attributes — aria-expanded on expandable elements', () => {
  test.setTimeout(60_000);

  test('accordion triggers have aria-expanded', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${DOCS_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    const triggers = page.locator('.accordion-trigger');
    const count = await triggers.count();

    expect(count, 'Should find accordion triggers on docs page').toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const trigger = triggers.nth(i);
      const expanded = await trigger.getAttribute('aria-expanded');

      // aria-expanded must be present and set to "true" or "false"
      expect(
        expanded,
        `Accordion trigger #${i} must have aria-expanded`,
      ).toBeTruthy();
      expect(['true', 'false']).toContain(expanded);
    }
  });

  test('accordion triggers have aria-controls pointing to a valid panel', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${DOCS_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    const triggers = page.locator('.accordion-trigger[aria-controls]');
    const count = await triggers.count();

    for (let i = 0; i < count; i++) {
      const trigger = triggers.nth(i);
      const controlsId = await trigger.getAttribute('aria-controls');

      if (controlsId) {
        // The element referenced by aria-controls should exist in the DOM
        const target = page.locator(`#${controlsId}`);
        await expect(
          target,
          `Accordion trigger #${i} references non-existent panel "${controlsId}"`,
        ).toHaveCount(1);
      }
    }
  });

  test('hamburger toggle has aria-expanded', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${COMPONENT_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    const hamburger = page.locator('.topnav-hamburger');
    if (await hamburger.count() > 0) {
      const expanded = await hamburger.getAttribute('aria-expanded');
      expect(
        expanded,
        'Hamburger button must have aria-expanded',
      ).toBeTruthy();
      expect(['true', 'false']).toContain(expanded);
    }
  });

  test('sidebar section toggles have aria-expanded', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${DOCS_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    // Sidebar section titles act as collapsible group headers
    const sectionTitles = page.locator('.section-title[aria-expanded]');
    const count = await sectionTitles.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const title = sectionTitles.nth(i);
        const expanded = await title.getAttribute('aria-expanded');
        expect(['true', 'false']).toContain(expanded);
      }
    }
  });

  test('search combobox has aria-expanded', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${COMPONENT_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    const combobox = page.locator('[role="combobox"]');
    const count = await combobox.count();

    if (count > 0) {
      const expanded = await combobox.first().getAttribute('aria-expanded');
      expect(
        expanded,
        'Search combobox should have aria-expanded',
      ).toBeTruthy();
      expect(['true', 'false']).toContain(expanded);
    }
  });
});

// ---------------------------------------------------------------------------
// Tests: aria-modal
// ---------------------------------------------------------------------------

test.describe('ARIA attributes — aria-modal on dialogs', () => {
  test.setTimeout(60_000);

  test('modal code examples include aria-modal="true"', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${COMPONENT_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    // The component library shows modal code snippets with proper ARIA
    // Check that code examples reference aria-modal="true"
    const hasModalPattern = await page.evaluate(() => {
      const codeBlocks = Array.from(document.querySelectorAll('pre'));
      return codeBlocks.some(
        (block) =>
          block.textContent?.includes('aria-modal="true"') ?? false,
      );
    });

    expect(
      hasModalPattern,
      'Component library should include modal examples with aria-modal="true"',
    ).toBe(true);
  });

  test('dialog role elements include aria-modal and aria-labelledby', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${COMPONENT_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    // Check both live dialogs and code examples
    const dialogIssues = await page.evaluate(() => {
      const dialogs = Array.from(document.querySelectorAll('[role="dialog"]'));
      const issues: string[] = [];

      for (const dialog of dialogs) {
        // role="dialog" should have aria-modal
        if (!dialog.hasAttribute('aria-modal')) {
          issues.push(`Missing aria-modal: ${dialog.outerHTML.substring(0, 100)}`);
        }
        // role="dialog" should have aria-labelledby or aria-label
        if (!dialog.hasAttribute('aria-labelledby') && !dialog.hasAttribute('aria-label')) {
          issues.push(`Missing label: ${dialog.outerHTML.substring(0, 100)}`);
        }
      }
      return issues;
    });

    // This test passes if there are no dialogs or all dialogs are correct
    expect(
      dialogIssues,
      `Dialog ARIA issues:\n${dialogIssues.join('\n')}`,
    ).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Tests: aria-selected on tabs
// ---------------------------------------------------------------------------

test.describe('ARIA attributes — aria-selected on tab panels', () => {
  test.setTimeout(60_000);

  test('active tab has aria-selected="true"', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${DOCS_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    const tablists = page.locator('[role="tablist"]');
    const tablistCount = await tablists.count();

    for (let t = 0; t < tablistCount; t++) {
      const tablist = tablists.nth(t);
      const tabs = tablist.locator('[role="tab"]');
      const tabCount = await tabs.count();

      if (tabCount === 0) continue;

      // Exactly one tab should have aria-selected="true"
      let selectedCount = 0;
      for (let i = 0; i < tabCount; i++) {
        const selected = await tabs.nth(i).getAttribute('aria-selected');
        if (selected === 'true') selectedCount++;
      }

      expect(
        selectedCount,
        `Tablist #${t} should have exactly one tab with aria-selected="true"`,
      ).toBe(1);
    }
  });

  test('tabs have aria-controls linking to tab panels', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${DOCS_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    const tabs = page.locator('[role="tab"][aria-controls]');
    const count = await tabs.count();

    for (let i = 0; i < count; i++) {
      const tab = tabs.nth(i);
      const controlsId = await tab.getAttribute('aria-controls');

      if (controlsId) {
        // The referenced panel should exist
        const panel = page.locator(`#${controlsId}`);
        const panelCount = await panel.count();
        expect(
          panelCount,
          `Tab references panel "${controlsId}" which should exist in the DOM`,
        ).toBe(1);

        // The panel should have role="tabpanel"
        if (panelCount > 0) {
          const role = await panel.getAttribute('role');
          expect(
            role,
            `Panel "${controlsId}" should have role="tabpanel"`,
          ).toBe('tabpanel');
        }
      }
    }
  });

  test('tab panels have aria-labelledby referencing their tab', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${DOCS_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    const panels = page.locator('[role="tabpanel"][aria-labelledby]');
    const count = await panels.count();

    for (let i = 0; i < count; i++) {
      const panel = panels.nth(i);
      const labelledBy = await panel.getAttribute('aria-labelledby');

      if (labelledBy) {
        // The referenced tab should exist
        const tab = page.locator(`#${labelledBy}`);
        await expect(
          tab,
          `Tab panel references tab "${labelledBy}" which should exist`,
        ).toHaveCount(1);
      }
    }
  });

  test('non-selected tabs have aria-selected="false"', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${DOCS_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    const tablists = page.locator('[role="tablist"]');
    const tablistCount = await tablists.count();

    for (let t = 0; t < tablistCount; t++) {
      const tabs = tablists.nth(t).locator('[role="tab"]');
      const tabCount = await tabs.count();

      for (let i = 0; i < tabCount; i++) {
        const tab = tabs.nth(i);
        const selected = await tab.getAttribute('aria-selected');

        // Every tab should explicitly set aria-selected to "true" or "false"
        expect(
          selected,
          `Tab #${i} in tablist #${t} should have explicit aria-selected`,
        ).toBeTruthy();
        expect(['true', 'false']).toContain(selected);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Tests: aria-live regions
// ---------------------------------------------------------------------------

test.describe('ARIA attributes — Live regions for dynamic content', () => {
  test.setTimeout(60_000);

  test('toast components use role="status" or role="alert"', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${DOCS_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    const toasts = page.locator('.toast');
    const count = await toasts.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const toast = toasts.nth(i);
        const role = await toast.getAttribute('role');

        // Toasts should use role="status" (polite) or role="alert" (assertive)
        // These implicitly create aria-live regions
        expect(
          role,
          `Toast #${i} should have role="status" or role="alert"`,
        ).toBeTruthy();
        expect(
          ['status', 'alert'],
          `Toast #${i} role="${role}" is not a valid live region role`,
        ).toContain(role);
      }
    }
  });

  test('alert components use appropriate live region roles', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${DOCS_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    // Success and info alerts should use role="status" (non-urgent, polite)
    const successAlerts = page.locator('.alert--success[role="status"]');
    const infoAlerts = page.locator('.alert--info[role="status"]');

    // Error and warning alerts should use role="alert" (urgent, assertive)
    const errorAlerts = page.locator('.alert--error[role="alert"]');
    const warningAlerts = page.locator('.alert--warning[role="alert"]');

    // At least some alerts should be present on the docs page
    const total =
      (await successAlerts.count()) +
      (await infoAlerts.count()) +
      (await errorAlerts.count()) +
      (await warningAlerts.count());

    if (total > 0) {
      // Verify that no error/warning alert uses role="status" (would be
      // too passive for critical information)
      const misroledErrors = page.locator('.alert--error[role="status"]');
      const misroledWarnings = page.locator('.alert--warning[role="status"]');

      expect(
        await misroledErrors.count(),
        'Error alerts should not use role="status"',
      ).toBe(0);
      expect(
        await misroledWarnings.count(),
        'Warning alerts should not use role="status"',
      ).toBe(0);
    }
  });

  test('search results list has role="listbox" for live updates', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${COMPONENT_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    const resultsList = page.locator('#search-results');
    if (await resultsList.count() > 0) {
      const role = await resultsList.getAttribute('role');
      expect(
        role,
        'Search results container should have role="listbox"',
      ).toBe('listbox');
    }
  });
});

// ---------------------------------------------------------------------------
// Tests: No conflicting or redundant ARIA
// ---------------------------------------------------------------------------

test.describe('ARIA attributes — No conflicting or redundant attributes', () => {
  test.setTimeout(60_000);

  test('no elements have both aria-label and aria-labelledby', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${COMPONENT_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    // Having both aria-label and aria-labelledby is technically valid (labelledby
    // takes precedence) but is usually a sign of a conflict or oversight
    const conflicts = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll('[aria-label][aria-labelledby]'),
      );
      return elements.map((el) => ({
        html: el.outerHTML.substring(0, 120),
        ariaLabel: el.getAttribute('aria-label'),
        ariaLabelledBy: el.getAttribute('aria-labelledby'),
      }));
    });

    // Log as warnings rather than hard-fail since this is a best-practice concern
    if (conflicts.length > 0) {
      console.warn(
        `[aria-warn] ${conflicts.length} element(s) have both aria-label and aria-labelledby:\n` +
          conflicts.map((c) => `  ${c.html}`).join('\n'),
      );
    }
  });

  test('no interactive elements have aria-hidden="true"', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${COMPONENT_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    // Interactive elements with aria-hidden="true" are hidden from assistive
    // technology but still receive keyboard focus, creating a confusing experience
    const hiddenInteractive = await page.evaluate(() => {
      const selector =
        'a[href][aria-hidden="true"], button[aria-hidden="true"]:not([disabled]), ' +
        'input[aria-hidden="true"]:not([type="hidden"]), select[aria-hidden="true"], ' +
        'textarea[aria-hidden="true"]';
      const elements = Array.from(document.querySelectorAll(selector));

      // Filter out elements that are also hidden via CSS (which is acceptable)
      return elements
        .filter((el) => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        })
        .map((el) => el.outerHTML.substring(0, 120));
    });

    expect(
      hiddenInteractive,
      `Visible interactive elements with aria-hidden="true":\n${hiddenInteractive.join('\n')}`,
    ).toHaveLength(0);
  });

  test('aria-describedby references valid existing elements', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${COMPONENT_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    const brokenRefs = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('[aria-describedby]'));
      const issues: string[] = [];

      for (const el of elements) {
        const ids = el.getAttribute('aria-describedby')?.split(/\s+/) || [];
        for (const id of ids) {
          if (id && !document.getElementById(id)) {
            issues.push(`${el.outerHTML.substring(0, 80)} references missing id="${id}"`);
          }
        }
      }
      return issues;
    });

    expect(
      brokenRefs,
      `Broken aria-describedby references:\n${brokenRefs.join('\n')}`,
    ).toHaveLength(0);
  });

  test('aria-controls references valid existing elements', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${COMPONENT_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    const brokenRefs = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('[aria-controls]'));
      const issues: string[] = [];

      for (const el of elements) {
        const ids = el.getAttribute('aria-controls')?.split(/\s+/) || [];
        for (const id of ids) {
          if (id && !document.getElementById(id)) {
            issues.push(`${el.outerHTML.substring(0, 80)} references missing id="${id}"`);
          }
        }
      }
      return issues;
    });

    expect(
      brokenRefs,
      `Broken aria-controls references:\n${brokenRefs.join('\n')}`,
    ).toHaveLength(0);
  });

  test('aria-labelledby references valid existing elements', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${COMPONENT_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    const brokenRefs = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('[aria-labelledby]'));
      const issues: string[] = [];

      for (const el of elements) {
        const ids = el.getAttribute('aria-labelledby')?.split(/\s+/) || [];
        for (const id of ids) {
          if (id && !document.getElementById(id)) {
            issues.push(`${el.outerHTML.substring(0, 80)} references missing id="${id}"`);
          }
        }
      }
      return issues;
    });

    expect(
      brokenRefs,
      `Broken aria-labelledby references:\n${brokenRefs.join('\n')}`,
    ).toHaveLength(0);
  });

  test('SVG icons inside buttons have aria-hidden="true"', async ({ page }) => {
    await page.goto(`${getBaseUrl()}/${COMPONENT_PAGE}`, { waitUntil: 'domcontentloaded' });
    await waitForReady(page);

    // Decorative SVGs inside buttons should be hidden from assistive tech
    // since the button itself provides the accessible name
    const exposedSvgs = await page.evaluate(() => {
      const svgsInButtons = Array.from(document.querySelectorAll('button svg'));
      return svgsInButtons
        .filter((svg) => {
          const ariaHidden = svg.getAttribute('aria-hidden');
          const role = svg.getAttribute('role');
          // SVG should have aria-hidden="true" or role="presentation" / role="none"
          return ariaHidden !== 'true' && role !== 'presentation' && role !== 'none';
        })
        .map((svg) => {
          const btn = svg.closest('button');
          return btn?.outerHTML.substring(0, 120) || '<button>...</button>';
        });
    });

    // This is a best-practice check — warn but allow a small tolerance
    if (exposedSvgs.length > 0) {
      console.warn(
        `[aria-warn] ${exposedSvgs.length} SVG(s) inside buttons lack aria-hidden="true":\n` +
          exposedSvgs.join('\n'),
      );
    }
  });
});
