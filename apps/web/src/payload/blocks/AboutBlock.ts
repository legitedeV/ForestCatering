import type { Block } from 'payload'

export const AboutBlock: Block = {
  slug: 'about',
  labels: { singular: 'O nas', plural: 'O nas' },
  fields: [
    { name: 'badge', type: 'text', label: 'Badge (np. O Forest Catering)' },
    { name: 'heading', type: 'text', required: true, label: 'Nagłówek' },
    { name: 'content', type: 'richText', label: 'Treść' },
    {
      name: 'highlights',
      type: 'array',
      label: 'Wyróżniki',
      labels: { singular: 'Wyróżnik', plural: 'Wyróżniki' },
      maxRows: 8,
      fields: [
        { name: 'text', type: 'text', required: true, label: 'Tekst' },
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Zdjęcie' },
    { name: 'ctaText', type: 'text', label: 'Tekst przycisku' },
    { name: 'ctaLink', type: 'text', label: 'Link przycisku' },
  ],
}
