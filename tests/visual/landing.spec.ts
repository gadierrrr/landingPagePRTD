import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 }
];

test.describe('Landing visual', () => {
  for (const vp of viewports) {
    test(`landing page @${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/landing');
      await expect(page.locator('h1')).toContainText('THE TIME TO SAVE IS NOW');
      // Basic screenshot (could add to snapshot tracking if needed)
      await page.screenshot({ path: `screenshots/landing-${vp.name}.png`, fullPage: true });
    });
  }
});
