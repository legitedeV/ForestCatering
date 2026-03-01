import { test, expect } from '@playwright/test'

/**
 * E2E smoke tests for split preview and a11y audit features.
 * These tests verify the UI presence of the new Phase 6B features.
 */
test.describe('Split Preview & A11y Audit', () => {
  test('split preview button exists in toolbar', async ({ page }) => {
    // Navigate to page editor (will fail to load actual data without DB, but UI renders)
    await page.goto('/page-editor/1')
    // Look for the split preview button
    const splitBtn = page.locator('button[aria-label="Przełącz podgląd wielourządzeniowy"]')
    await expect(splitBtn).toBeVisible({ timeout: 10000 })
  })

  test('a11y audit button exists in toolbar', async ({ page }) => {
    await page.goto('/page-editor/1')
    const a11yBtn = page.locator('button[aria-label="Audyt dostępności"]')
    await expect(a11yBtn).toBeVisible({ timeout: 10000 })
  })

  test('a11y panel opens on button click', async ({ page }) => {
    await page.goto('/page-editor/1')
    const a11yBtn = page.locator('button[aria-label="Audyt dostępności"]')
    await expect(a11yBtn).toBeVisible({ timeout: 10000 })
    await a11yBtn.click()
    // Panel should appear with the audit heading
    const panelHeading = page.locator('text=Audyt dostępności')
    await expect(panelHeading).toBeVisible({ timeout: 5000 })
  })
})
