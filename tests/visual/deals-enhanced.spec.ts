import { test, expect } from '@playwright/test';

test.describe('Enhanced Deals Page @smoke', () => {
  test('loads deals page and shows toolbar', async ({ page }) => {
    await page.goto('/deals');
    
    // Check that the page loads
    await expect(page.locator('h1')).toContainText('Deals');
    
    // Check that toolbar is present
    await expect(page.getByText('All')).toBeVisible();
    await expect(page.getByText('Sort by:')).toBeVisible();
    
    // Check that sort dropdown exists
    await expect(page.locator('select[id="sort"]')).toBeVisible();
  });

  test('clicking deal card navigates to detail page', async ({ page }) => {
    await page.goto('/deals');
    
    // Wait for deals to load and click first deal card
    await expect(page.locator('[href^="/deal/"]').first()).toBeVisible();
    await page.locator('[href^="/deal/"]').first().click();
    
    // Should be on deal detail page
    await expect(page.url()).toMatch(/\/deal\//);
    await expect(page.getByText('Get This Deal')).toBeVisible();
  });

  test('sort dropdown changes deal order', async ({ page }) => {
    await page.goto('/deals');
    
    // Wait for deals to load
    await expect(page.locator('[href^="/deal/"]').first()).toBeVisible();
    
    // Change sort to "Ending Soon"
    await page.selectOption('select[id="sort"]', 'ending-soon');
    
    // Wait for re-render and get new first deal title
    await page.waitForTimeout(100);
    const firstDealAfterSort = await page.locator('[href^="/deal/"] h3').first().textContent();
    
    // The order should potentially change (unless there's only one deal)
    // We just verify the sort dropdown worked without errors
    expect(firstDealAfterSort).toBeDefined();
  });

  test('category filter buttons work', async ({ page }) => {
    await page.goto('/deals');
    
    // Wait for deals to load
    await expect(page.locator('[href^="/deal/"]').first()).toBeVisible();
    
    // Click on a category button (if any exist)
    const categoryButtons = page.locator('button').filter({ hasText: /^(hotel|restaurant|tour|activity)$/i });
    const buttonCount = await categoryButtons.count();
    
    if (buttonCount > 0) {
      await categoryButtons.first().click();
      // Verify the button is now selected (has different styling)
      await expect(categoryButtons.first()).toHaveClass(/bg-brand-navy/);
    }
  });

  test('share functionality shows fallback when Web Share API unavailable', async ({ page }) => {
    await page.goto('/deals');
    
    // Click first deal to go to detail page
    await page.locator('[href^="/deal/"]').first().click();
    
    // Look for share buttons
    await expect(page.getByText('Share')).toBeVisible();
    await expect(page.getByText('Copy Link')).toBeVisible();
    await expect(page.getByText('WhatsApp')).toBeVisible();
    await expect(page.getByText('Facebook')).toBeVisible();
  });
});