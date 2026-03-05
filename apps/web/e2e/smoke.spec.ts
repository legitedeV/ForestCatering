import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Forest/i);
  });

  test('navigation is visible', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('main content sections exist', async ({ page }) => {
    await page.goto('/');
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });
});
