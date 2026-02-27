import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { generateAutoSlug } from '../hooks/generateAutoSlug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Kategoria', plural: 'Kategorie' },
  admin: { useAsTitle: 'name' },
  hooks: {
    beforeValidate: [
      generateAutoSlug({
        slugField: 'slug',
        sourceFields: ['title', 'name'],
      }),
    ],
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Nazwa' },
    { name: 'slug', type: 'text', required: true, unique: true, label: 'Slug (URL)' },
    { name: 'description', type: 'textarea', label: 'Opis' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Zdjęcie' },
    { name: 'parent', type: 'relationship', relationTo: 'categories', label: 'Kategoria nadrzędna' },
    { name: 'sortOrder', type: 'number', defaultValue: 0, label: 'Kolejność sortowania' },
  ],
}
