import type { Block } from 'payload'

export const CTABlock: Block = {
  slug: 'cta',
  labels: { singular: 'Wezwanie do działania', plural: 'Wezwania do działania' },
  fields: [
    { name: 'heading', type: 'text', required: true, label: 'Nagłówek' },
    { name: 'text', type: 'textarea', label: 'Treść' },
    { name: 'buttonText', type: 'text', required: true, label: 'Tekst przycisku' },
    { name: 'buttonLink', type: 'text', required: true, label: 'Link przycisku' },
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'primary',
      label: 'Wariant',
      options: [
        { label: 'Główny', value: 'primary' },
        { label: 'Drugorzędny', value: 'secondary' },
      ],
    },
    { name: 'phoneNumber', type: 'text', label: 'Numer telefonu' },
    { name: 'secondaryButtonText', type: 'text', label: 'Tekst drugiego przycisku' },
    { name: 'secondaryButtonLink', type: 'text', label: 'Link drugiego przycisku' },
  ],
}
