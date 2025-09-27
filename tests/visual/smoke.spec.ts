import { test, expect } from '@playwright/test';

// Minimal fast smoke test tagged so CI can run only this with --grep @smoke
// Verifies the landing page loads and primary hero heading renders.

test('landing smoke @smoke', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('THE TIME TO SAVE IS NOW');
});
