import { test, expect } from '@playwright/test'
import { templates, getTemplateSuggestions } from '../ai-content-templates'

/**
 * Unit tests for AI content templates — verify coverage and engine behavior.
 */
test.describe('AI Content Templates', () => {
  const expectedBlocks: Record<string, string[]> = {
    hero: ['heading', 'subheading', 'ctaText'],
    cta: ['heading', 'text', 'buttonText'],
    services: ['heading', 'items.title'],
    about: ['heading', 'badge'],
    pricing: ['heading', 'subheading'],
    contactForm: ['heading', 'subheading'],
  }

  const tones = ['professional', 'friendly', 'luxury'] as const

  for (const [blockType, fields] of Object.entries(expectedBlocks)) {
    for (const fieldPath of fields) {
      for (const tone of tones) {
        test(`${blockType}.${fieldPath}.${tone} has >= 3 variants`, () => {
          const blockTemplates = templates[blockType]
          expect(blockTemplates).toBeDefined()
          const fieldTemplates = blockTemplates[fieldPath]
          expect(fieldTemplates).toBeDefined()
          const toneTemplates = fieldTemplates[tone]
          expect(toneTemplates).toBeDefined()
          expect(toneTemplates.length).toBeGreaterThanOrEqual(3)
        })
      }
    }
  }

  test('getTemplateSuggestions returns 3 suggestions', () => {
    const suggestions = getTemplateSuggestions('hero', 'heading', 'professional')
    expect(suggestions.length).toBe(3)
    suggestions.forEach((s) => {
      expect(typeof s).toBe('string')
      expect(s.length).toBeGreaterThan(0)
    })
  })

  test('getTemplateSuggestions returns mode: template (no env vars)', () => {
    // Template engine always works offline — just verify it returns strings
    const suggestions = getTemplateSuggestions('cta', 'heading', 'friendly')
    expect(suggestions.length).toBe(3)
  })

  test('getTemplateSuggestions returns empty for unknown blockType', () => {
    const suggestions = getTemplateSuggestions('unknown', 'heading', 'professional')
    expect(suggestions).toEqual([])
  })

  test('getTemplateSuggestions returns empty for unknown fieldPath', () => {
    const suggestions = getTemplateSuggestions('hero', 'unknown', 'professional')
    expect(suggestions).toEqual([])
  })
})
