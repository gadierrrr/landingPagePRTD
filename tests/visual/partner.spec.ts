import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
] as const;

VIEWPORTS.forEach(({ name, width, height }) => {
  test(`${name} visual snapshot`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/partner');
    
    await expect(page).toHaveScreenshot(`partner-${name}.png`);
  });
});