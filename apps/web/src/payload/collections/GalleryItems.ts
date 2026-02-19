import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrEditor } from '../access/isAdminOrEditor'

export const GalleryItems: CollectionConfig = {
  slug: 'gallery-items',
  admin: { useAsTitle: 'alt' },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'alt', type: 'text', required: true },
    {
      name: 'category',
      type: 'select',
      options: ['wesela', 'eventy-firmowe', 'catering-prywatny', 'bar', 'dekoracje'],
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
  ],
}
