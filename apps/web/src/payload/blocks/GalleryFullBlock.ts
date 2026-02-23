import type { Block } from 'payload'

export const GalleryFullBlock: Block = {
  slug: 'galleryFull',
  labels: { singular: 'Pełna galeria', plural: 'Pełne galerie' },
  fields: [
    { name: 'heading', type: 'text', label: 'Nagłówek sekcji' },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 50,
      labels: { singular: 'Zdjęcie', plural: 'Zdjęcia' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Zdjęcie' },
        { name: 'alt', type: 'text', label: 'Opis zdjęcia' },
        { name: 'category', type: 'text', label: 'Kategoria (slug)' },
        { name: 'categoryLabel', type: 'text', label: 'Nazwa kategorii' },
      ],
    },
  ],
}
