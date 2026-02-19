import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrEditor } from '../access/isAdminOrEditor'

export const EventPackages: CollectionConfig = {
  slug: 'event-packages',
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'tier',
      type: 'select',
      required: true,
      options: ['basic', 'premium', 'catering-plus-bar'],
    },
    { name: 'description', type: 'richText' },
    {
      name: 'priceFrom',
      type: 'number',
      admin: { description: 'Cena od... w groszach/os.' },
    },
    {
      name: 'features',
      type: 'array',
      fields: [{ name: 'feature', type: 'text', required: true }],
    },
    { name: 'sampleMenu', type: 'richText' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
  ],
}
