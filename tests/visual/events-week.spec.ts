import { test, expect } from '@playwright/test';

test('events week page loads with correct event count', async ({ page }) => {
  await page.goto('/events/week/2025-09-01');
  
  // Wait for events to load and count visible event cards
  const eventCards = page.locator('[class*="grid"] > div').filter({ hasText: /title|venue|date/i });
  await expect(eventCards).toHaveCount(9);
});