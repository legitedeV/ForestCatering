import type { Block } from 'payload'

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  labels: { singular: 'Opinie klientów', plural: 'Opinie klientów' },
  fields: [
    { name: 'heading', type: 'text', label: 'Nagłówek' },
    {
      name: 'items',
      type: 'array',
      label: 'Opinie',
      labels: { singular: 'Opinia', plural: 'Opinie' },
      maxRows: 12,
      fields: [
        { name: 'quote', type: 'textarea', required: true, label: 'Cytat' },
        { name: 'author', type: 'text', required: true, label: 'Autor' },
        { name: 'event', type: 'text', label: 'Wydarzenie' },
        { name: 'rating', type: 'number', defaultValue: 5, min: 1, max: 5, label: 'Ocena' },
      ],
    },
  ],
}
