import type { Block } from 'payload'

export const StepsBlock: Block = {
  slug: 'steps',
  labels: { singular: 'Kroki', plural: 'Kroki' },
  fields: [
    { name: 'heading', type: 'text', label: 'Nagłówek sekcji' },
    {
      name: 'steps',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 10,
      labels: { singular: 'Krok', plural: 'Kroki' },
      fields: [
        { name: 'emoji', type: 'text', required: true, label: 'Emoji' },
        { name: 'title', type: 'text', required: true, label: 'Tytuł kroku' },
        { name: 'description', type: 'textarea', required: true, label: 'Opis kroku' },
      ],
    },
  ],
}
