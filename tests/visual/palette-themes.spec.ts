import { test, expect } from '@playwright/test';
import { PALETTES } from '../../playwright.config';
import { BASE_URL, setTheme, waitForAssets } from './helpers';

const TARGET_PAGE = 'docs/component-library.html';

for (const palette of PALETTES) {
  test.describe(`palette: ${palette}`, () => {
    test(`component-library screenshot`, async ({ page }) => {
      await page.goto(`${BASE_URL}/${TARGET_PAGE}`);
      await setTheme(page, palette);
      await waitForAssets(page);
      await expect(page).toHaveScreenshot(`palette-${palette}.png`);
    });
  });
}
