import { test, expect } from '@playwright/test'
import { generateBlockScopedCss, generateAllBlocksCss } from '../src/lib/block-style-injector'

/**
 * Unit tests for block-style-injector (no browser needed).
 */
test.describe('generateBlockScopedCss', () => {
  test('returns empty string when no overrides', () => {
    const css = generateBlockScopedCss('block-1', undefined)
    expect(css).toBe('')
  })

  test('generates textColor rule with !important', () => {
    const css = generateBlockScopedCss('block-1', { textColor: '#ff0000' })
    expect(css).toContain('#ff0000')
    expect(css).toContain('!important')
    expect(css).toContain('[data-block-id="block-1"]')
  })

  test('generates background-color rule for solid backgroundType', () => {
    const css = generateBlockScopedCss('block-1', {
      backgroundType: 'solid',
      backgroundColor: '#001122',
    })
    expect(css).toContain('background-color: #001122')
    expect(css).toContain('!important')
  })

  test('generates accentColor rules', () => {
    const css = generateBlockScopedCss('block-abc', { accentColor: '#D4A853' })
    expect(css).toContain('#D4A853')
    expect(css).toContain('[data-block-id="block-abc"]')
  })

  test('generates borderRadius rule', () => {
    const css = generateBlockScopedCss('blk', { borderRadius: 8 })
    expect(css).toContain('border-radius: 8px')
  })
})

test.describe('generateAllBlocksCss', () => {
  test('combines CSS for multiple blocks', () => {
    const css = generateAllBlocksCss([
      { id: 'b1', styleOverrides: { textColor: '#aaa' } },
      { id: 'b2', styleOverrides: { backgroundColor: '#bbb', backgroundType: 'solid' } },
    ])
    expect(css).toContain('[data-block-id="b1"]')
    expect(css).toContain('[data-block-id="b2"]')
  })

  test('returns empty string for empty sections', () => {
    const css = generateAllBlocksCss([])
    expect(css).toBe('')
  })

  test('skips sections without styleOverrides', () => {
    const css = generateAllBlocksCss([{ id: 'b1' }, { id: 'b2' }])
    expect(css).toBe('')
  })
})
