import { Page } from '@playwright/test';

/** Base URL for loading local doc pages in Playwright. */
export const BASE_URL = `file://${process.cwd()}`;

/**
 * Set the palette theme on the page by updating the data-theme attribute.
 */
export async function setTheme(page: Page, palette: string): Promise<void> {
  await page.evaluate((p) => {
    document.documentElement.setAttribute('data-theme', p);
  }, palette);
}

/**
 * Toggle dark mode by adding or removing the docs-dark class on <html>.
 */
export async function setDarkMode(page: Page, enabled: boolean): Promise<void> {
  await page.evaluate((dark) => {
    document.documentElement.classList.toggle('docs-dark', dark);
  }, enabled);
}

/**
 * Wait for fonts and images to finish loading before taking a screenshot.
 * - Waits for network idle
 * - Waits for document.fonts.ready
 * - Waits for all <img> elements to complete loading
 */
export async function waitForAssets(page: Page): Promise<void> {
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
