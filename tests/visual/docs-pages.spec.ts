import { test, expect } from '@playwright/test';
import { PAGES } from '../../playwright.config';
import { BASE_URL, setDarkMode, waitForAssets } from './helpers';

for (const page of PAGES) {
  test.describe(`${page.name} page`, () => {
    test(`light mode screenshot`, async ({ page: p }) => {
      await p.goto(`${BASE_URL}/${page.path}`);
      await waitForAssets(p);
      await expect(p).toHaveScreenshot(`${page.name}-light.png`);
    });

    test(`dark mode screenshot`, async ({ page: p }) => {
      await p.goto(`${BASE_URL}/${page.path}`);
      await setDarkMode(p, true);
      await waitForAssets(p);
      await expect(p).toHaveScreenshot(`${page.name}-dark.png`);
    });
  });
}
