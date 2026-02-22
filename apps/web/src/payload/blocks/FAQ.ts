import type { Block } from 'payload'

export const FAQBlock: Block = {
  slug: 'faq',
  labels: { singular: 'Pytania i odpowiedzi', plural: 'FAQ' },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Pytania',
      labels: { singular: 'Pytanie', plural: 'Pytania' },
      maxRows: 12,
      fields: [
        { name: 'question', type: 'text', required: true, label: 'Pytanie' },
        { name: 'answer', type: 'textarea', required: true, label: 'Odpowiedź' },
      ],
    },
  ],
}
