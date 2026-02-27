import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { generateAutoSlug } from '../hooks/generateAutoSlug'

export const EventPackages: CollectionConfig = {
  slug: 'event-packages',
  labels: { singular: 'Pakiet eventowy', plural: 'Pakiety eventowe' },
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
    create: isAdmin,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Nazwa' },
    { name: 'slug', type: 'text', required: true, unique: true, label: 'Slug (URL)' },
    {
      name: 'tier',
      type: 'select',
      required: true,
      label: 'Poziom pakietu',
      options: [
        { label: 'Podstawowy', value: 'basic' },
        { label: 'Premium', value: 'premium' },
        { label: 'Catering + Bar', value: 'catering-plus-bar' },
      ],
    },
    { name: 'description', type: 'richText', label: 'Opis' },
    {
      name: 'priceFrom',
      type: 'number',
      label: 'Cena od (za osobę)',
      admin: { description: 'Cena od... w groszach za osobę' },
    },
    {
      name: 'features',
      type: 'array',
      label: 'Cechy pakietu',
      labels: { singular: 'Cecha', plural: 'Cechy' },
      fields: [{ name: 'feature', type: 'text', required: true, label: 'Cecha' }],
    },
    { name: 'sampleMenu', type: 'richText', label: 'Przykładowe menu' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Zdjęcie' },
    { name: 'sortOrder', type: 'number', defaultValue: 0, label: 'Kolejność sortowania' },
  ],
}
