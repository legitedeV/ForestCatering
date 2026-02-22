import { expect, test } from '@playwright/test'

test('homepage renders without errors', async ({ page }) => {
  const response = await page.goto('/', { waitUntil: 'networkidle' })
  expect(response?.status()).toBeLessThan(500)

  // Should render either CMS content or the hardcoded fallback
  // Both should have a visible h1 element
  const h1 = page.locator('h1').first()
  await expect(h1).toBeVisible()

  // The page must not contain raw HTML tags (no dangerouslySetInnerHTML leaks)
  await expect(page.locator('body')).not.toContainText('<h1>')
  await expect(page.locator('body')).not.toContainText('<div>')
})

test('homepage screenshot', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  await page.screenshot({ path: 'test-results/homepage-cms.png', fullPage: true })
})
