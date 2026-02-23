import type { Block } from 'payload'

export const PricingBlock: Block = {
  slug: 'pricing',
  labels: { singular: 'Cennik', plural: 'Cenniki' },
  fields: [
    { name: 'heading', type: 'text', label: 'Nagłówek sekcji' },
    { name: 'subheading', type: 'textarea', label: 'Podnagłówek' },
    {
      name: 'packages',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 12,
      labels: { singular: 'Pakiet', plural: 'Pakiety' },
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Nazwa pakietu' },
        { name: 'price', type: 'text', required: true, label: 'Cena' },
        {
          name: 'features',
          type: 'array',
          minRows: 1,
          labels: { singular: 'Cecha', plural: 'Cechy' },
          fields: [{ name: 'text', type: 'text', required: true, label: 'Treść' }],
        },
        { name: 'ctaText', type: 'text', label: 'Tekst CTA' },
        { name: 'ctaLink', type: 'text', label: 'Link CTA' },
        { name: 'featured', type: 'checkbox', label: 'Wyróżniony', defaultValue: false },
      ],
    },
  ],
}
