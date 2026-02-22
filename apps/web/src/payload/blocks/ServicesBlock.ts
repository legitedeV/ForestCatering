import type { Block } from 'payload'

export const ServicesBlock: Block = {
  slug: 'services',
  labels: { singular: 'Usługi', plural: 'Usługi' },
  fields: [
    { name: 'heading', type: 'text', label: 'Nagłówek sekcji' },
    {
      name: 'items',
      type: 'array',
      label: 'Usługi',
      labels: { singular: 'Usługa', plural: 'Usługi' },
      maxRows: 8,
      fields: [
        { name: 'emoji', type: 'text', required: true, label: 'Emoji' },
        { name: 'title', type: 'text', required: true, label: 'Tytuł' },
        { name: 'description', type: 'textarea', required: true, label: 'Opis' },
        { name: 'link', type: 'text', label: 'Link' },
      ],
    },
  ],
}
