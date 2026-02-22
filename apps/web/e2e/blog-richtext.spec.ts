import { test, expect } from '@playwright/test'

test('blog list shows at least one post link', async ({ page }) => {
  await page.goto('/blog', { waitUntil: 'networkidle' })
  const postLinks = page.locator('a[href^="/blog/"]')
  const count = await postLinks.count()
  expect(count).toBeGreaterThan(0)
})

test.describe('Blog post richtext rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog/startujemy-z-blogiem-forest-catering', { waitUntil: 'networkidle' })
    await page.waitForSelector('h1')
  })

  test('shows post title in h1', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Startujemy z blogiem Forest Catering')
  })

  test('prose container renders h2 heading elements', async ({ page }) => {
    await expect(page.locator('.prose h2').first()).toBeVisible()
  })

  test('prose container renders strong/bold elements', async ({ page }) => {
    await expect(page.locator('.prose strong').first()).toBeVisible()
  })

  test('prose container renders list elements (ul or ol)', async ({ page }) => {
    const lists = page.locator('.prose ul, .prose ol')
    const count = await lists.count()
    expect(count).toBeGreaterThan(0)
  })

  test('prose container renders link elements', async ({ page }) => {
    await expect(page.locator('.prose a[href]').first()).toBeVisible()
  })

  test('prose container renders blockquote elements', async ({ page }) => {
    await expect(page.locator('.prose blockquote').first()).toBeVisible()
  })

  test('XSS: no script tags in prose content', async ({ page }) => {
    const scripts = page.locator('.prose script')
    await expect(scripts).toHaveCount(0)
  })

  test('takes screenshot of blog post page', async ({ page }) => {
    await page.screenshot({ path: 'test-results/blog-post-richtext.png', fullPage: true })
  })
})
