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

export const TeamBlock: Block = {
  slug: 'team',
  labels: { singular: 'Zespół', plural: 'Zespół' },
  fields: [
    { name: 'heading', type: 'text', label: 'Nagłówek sekcji' },
    {
      name: 'people',
      type: 'array',
      required: true,
      minRows: 1,
      label: 'Członkowie zespołu',
      labels: { singular: 'Osoba', plural: 'Osoby' },
      fields: [
        { name: 'photo', type: 'upload', relationTo: 'media', required: true, label: 'Zdjęcie' },
        { name: 'name', type: 'text', required: true, label: 'Imię i nazwisko' },
        { name: 'role', type: 'text', required: true, label: 'Rola' },
        { name: 'bio', type: 'textarea', label: 'Bio' },
        {
          name: 'socials',
          type: 'array',
          label: 'Social media',
          labels: { singular: 'Social', plural: 'Social media' },
          fields: [
            { name: 'label', type: 'text', required: true, label: 'Etykieta' },
            { name: 'url', type: 'text', required: true, label: 'Link', validate: validateOptionalUrl },
          ],
        },
      ],
    },
  ],
}
