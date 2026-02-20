import type { Block } from 'payload'

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: 'Galeria', plural: 'Galerie' },
  fields: [
    {
      name: 'images',
      type: 'array',
      label: 'Zdjęcia',
      labels: { singular: 'Zdjęcie', plural: 'Zdjęcia' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Zdjęcie' },
      ],
    },
  ],
}
