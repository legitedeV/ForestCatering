import type { Block } from 'payload'

const validateHttpsUrl = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) return 'Link mapy jest wymagany.'
  if (!value.startsWith('https://')) return 'Link musi zaczynać się od https://.'

  try {
    new URL(value)
    return true
  } catch {
    return 'Podaj poprawny link mapy.'
  }
}

export const MapAreaBlock: Block = {
  slug: 'mapArea',
  labels: { singular: 'Mapa / Obszar działania', plural: 'Mapa / Obszary działania' },
  fields: [
    { name: 'heading', type: 'text', label: 'Nagłówek sekcji' },
    { name: 'description', type: 'textarea', label: 'Opis' },
    { name: 'embedUrl', type: 'text', required: true, label: 'Link osadzenia mapy (iframe)', validate: validateHttpsUrl },
    {
      name: 'cities',
      type: 'array',
      label: 'Obsługiwane miasta',
      labels: { singular: 'Miasto', plural: 'Miasta' },
      fields: [{ name: 'name', type: 'text', required: true, label: 'Nazwa miasta' }],
    },
    { name: 'note', type: 'text', label: 'Notatka' },
  ],
}
