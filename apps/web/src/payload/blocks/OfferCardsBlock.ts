import type { Block } from 'payload'

const validateCtaLink = (value: unknown) => {
  if (!value) return true
  if (typeof value !== 'string') return 'Podaj poprawny link CTA.'

  if (value.startsWith('/')) return true

  try {
    new URL(value)
    return true
  } catch {
    return 'Podaj poprawny link CTA (np. /oferta lub https://example.com).'
  }
}

export const OfferCardsBlock: Block = {
  slug: 'offerCards',
  labels: { singular: 'Karty ofertowe', plural: 'Karty ofertowe' },
  fields: [
    { name: 'heading', type: 'text', label: 'Nagłówek sekcji' },
    {
      name: 'cards',
      type: 'array',
      required: true,
      minRows: 1,
      label: 'Karty',
      labels: { singular: 'Karta', plural: 'Karty' },
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Tytuł' },
        { name: 'priceFrom', type: 'text', label: 'Cena od' },
        { name: 'badge', type: 'text', label: 'Badge' },
        { name: 'featured', type: 'checkbox', label: 'Wyróżniona', defaultValue: false },
        {
          name: 'features',
          type: 'array',
          minRows: 1,
          required: true,
          label: 'Cechy',
          labels: { singular: 'Cecha', plural: 'Cechy' },
          fields: [{ name: 'text', type: 'text', required: true, label: 'Treść' }],
        },
        { name: 'ctaText', type: 'text', label: 'Tekst CTA' },
        { name: 'ctaLink', type: 'text', label: 'Link CTA', validate: validateCtaLink },
      ],
    },
  ],
}
