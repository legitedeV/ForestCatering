import crypto from 'crypto'
import { expect, test } from '@playwright/test'

test('oferta page renders CMS content', async ({ page }) => {
  const response = await page.goto('/oferta', { waitUntil: 'networkidle' })
  expect(response?.ok()).toBeTruthy()
  await expect(page.locator('h1, h2').first()).toContainText(/oferta|pakiety/i)
})

test('catch-all route renders CMS page', async ({ page }) => {
  const response = await page.goto('/regulamin', { waitUntil: 'networkidle' })
  expect(response?.ok()).toBeTruthy()
  await expect(page.locator('body')).toContainText('Regulamin')
})

test('preview endpoint rejects missing and invalid secrets', async ({ request }) => {
  const missingSecretResponse = await request.get('/api/preview?slug=home')
  expect(missingSecretResponse.status()).toBe(400)

  const invalidSecretResponse = await request.get('/api/preview?slug=home&secret=invalid-secret')
  expect(invalidSecretResponse.status()).toBe(401)
})

test('preview endpoint accepts valid secret', async ({ request }) => {
  const secret = process.env.PAYLOAD_PREVIEW_SECRET
  test.skip(!secret, 'PAYLOAD_PREVIEW_SECRET is required')

  const response = await request.get(`/api/preview?slug=home&secret=${encodeURIComponent(secret as string)}`)
  expect(response.status()).toBe(307)
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
})
