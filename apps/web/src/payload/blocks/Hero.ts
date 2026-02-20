import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Baner główny', plural: 'Banery główne' },
  fields: [
    { name: 'heading', type: 'text', required: true, label: 'Nagłówek' },
    { name: 'subheading', type: 'text', label: 'Podtytuł' },
    { name: 'backgroundImage', type: 'upload', relationTo: 'media', label: 'Zdjęcie tła' },
    { name: 'ctaText', type: 'text', label: 'Tekst przycisku' },
    { name: 'ctaLink', type: 'text', label: 'Link przycisku' },
  ],
}
