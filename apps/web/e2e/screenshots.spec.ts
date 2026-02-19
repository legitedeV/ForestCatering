import { test } from '@playwright/test'

const pages = [
  { name: 'homepage', path: '/' },
  { name: 'sklep', path: '/sklep' },
  { name: 'koszyk-empty', path: '/koszyk' },
  { name: 'oferta', path: '/oferta' },
  { name: 'eventy', path: '/eventy' },
  { name: 'galeria', path: '/galeria' },
  { name: 'blog', path: '/blog' },
  { name: 'kontakt', path: '/kontakt' },
  { name: 'regulamin', path: '/regulamin' },
  { name: 'polityka', path: '/polityka-prywatnosci' },
  { name: 'admin', path: '/admin' },
]

for (const { name, path } of pages) {
  test(`screenshot: ${name}`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    await page.screenshot({ path: `test-results/${name}.png`, fullPage: true })
  })
}
