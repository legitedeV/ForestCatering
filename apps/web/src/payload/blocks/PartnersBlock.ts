import type { Block } from 'payload'

const validateOptionalUrl = (value: unknown) => {
  if (!value) return true
  if (typeof value !== 'string') return 'Podaj poprawny adres URL.'

  try {
    new URL(value)
    return true
  } catch {
    return 'Podaj poprawny adres URL (np. https://example.com).'
  }
}

export const PartnersBlock: Block = {
  slug: 'partners',
  labels: { singular: 'Partnerzy', plural: 'Partnerzy' },
  fields: [
    { name: 'heading', type: 'text', required: true, label: 'Nagłówek sekcji' },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      label: 'Partnerzy',
      labels: { singular: 'Partner', plural: 'Partnerzy' },
      fields: [
        { name: 'logo', type: 'upload', relationTo: 'media', required: true, label: 'Logo' },
        { name: 'name', type: 'text', required: true, label: 'Nazwa' },
        { name: 'url', type: 'text', label: 'Link', validate: validateOptionalUrl },
      ],
    },
    {
      name: 'variant',
      type: 'select',
      label: 'Wariant',
      defaultValue: 'grid',
      options: [
        { label: 'Siatka', value: 'grid' },
        { label: 'Karuzela', value: 'carousel' },
      ],
    },
    { name: 'grayscale', type: 'checkbox', label: 'Skala szarości logo', defaultValue: true },
  ],
}
