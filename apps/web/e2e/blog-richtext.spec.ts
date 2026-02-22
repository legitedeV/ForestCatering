import { expect, test } from '@playwright/test'

test('blog post renders rich text nodes', async ({ page }) => {
  await page.goto('/blog/startujemy-z-blogiem-forest-catering', { waitUntil: 'networkidle' })

  await expect(page.locator('h2')).toContainText('Dlaczego uruchomiliśmy blog?')
  await expect(page.locator('strong')).toContainText('praktyczne porady')
  await expect(page.locator('ul li')).toContainText('menu sezonowe')
  await expect(page.locator('body')).not.toContainText('<h2>')
})

test('blog page does not expose script tags in article body', async ({ page }) => {
  await page.goto('/blog/formatowanie-naglowki-listy-cytaty', { waitUntil: 'networkidle' })

  await expect(page.locator('h2')).toContainText('Test renderowania rich text')
  await expect(page.locator('article script, .prose script')).toHaveCount(0)
  await expect(page.locator('body')).not.toContainText('alert(')
})
