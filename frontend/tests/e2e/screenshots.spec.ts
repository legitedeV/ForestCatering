import { test } from '@playwright/test';

test('home screenshot', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: 'artifacts/home.png', fullPage: true });
});

test('produkt route screenshot', async ({ page }) => {
  await page.goto('/produkt/1');
  await page.screenshot({ path: 'artifacts/produkt-1.png', fullPage: true });
});
