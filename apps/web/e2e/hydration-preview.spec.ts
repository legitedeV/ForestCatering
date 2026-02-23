import { expect, test } from '@playwright/test'
import crypto from 'crypto'

test('no hydration errors on homepage and admin', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    const text = msg.text().toLowerCase()
    if (msg.type() === 'error' || text.includes('hydration') || text.includes('react error #418')) {
      errors.push(msg.text())
    }
  })
  page.on('pageerror', (err) => errors.push(String(err)))

  await page.goto('/', { waitUntil: 'networkidle' })
  await page.goto('/admin', { waitUntil: 'networkidle' })

  expect(errors, `Hydration/runtime errors found:\n${errors.join('\n')}`).toEqual([])
})

test('revalidate endpoint accepts signed request', async ({ request }) => {
  const secret = process.env.PAYLOAD_REVALIDATE_SECRET
  test.skip(!secret, 'PAYLOAD_REVALIDATE_SECRET is required for this smoke test')

  const payload = { collection: 'pages', slug: process.env.HOME_PAGE_SLUG || 'home' }
  const body = JSON.stringify(payload)
  const signature = crypto.createHmac('sha256', secret as string).update(body).digest('hex')

  const response = await request.post('/api/revalidate', {
    data: payload,
    headers: {
      'content-type': 'application/json',
      'x-payload-signature': signature,
    },
  })

  expect(response.ok()).toBeTruthy()
  await expect(response.json()).resolves.toMatchObject({ revalidated: true })
})
