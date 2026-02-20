import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrEditor } from '../access/isAdminOrEditor'

export const GalleryItems: CollectionConfig = {
  slug: 'gallery-items',
  labels: { singular: 'Zdjęcie w galerii', plural: 'Galeria' },
  admin: { useAsTitle: 'alt' },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Zdjęcie' },
    { name: 'alt', type: 'text', required: true, label: 'Opis alternatywny (alt)' },
    {
      name: 'category',
      type: 'select',
      label: 'Kategoria',
      options: [
        { label: 'Wesela', value: 'wesela' },
        { label: 'Eventy firmowe', value: 'eventy-firmowe' },
        { label: 'Catering prywatny', value: 'catering-prywatny' },
        { label: 'Bar', value: 'bar' },
        { label: 'Dekoracje', value: 'dekoracje' },
      ],
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0, label: 'Kolejność sortowania' },
  ],
}
