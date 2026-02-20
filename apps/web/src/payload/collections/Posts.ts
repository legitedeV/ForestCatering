import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrEditor } from '../access/isAdminOrEditor'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Wpis', plural: 'Blog' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt'],
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Tytuł' },
    { name: 'slug', type: 'text', required: true, unique: true, label: 'Slug (URL)' },
    { name: 'content', type: 'richText', required: true, label: 'Treść' },
    { name: 'excerpt', type: 'textarea', maxLength: 300, label: 'Zajawka' },
    { name: 'cover', type: 'upload', relationTo: 'media', label: 'Zdjęcie główne' },
    { name: 'publishedAt', type: 'date', label: 'Data publikacji' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      label: 'Status',
      options: [
        { label: 'Szkic', value: 'draft' },
        { label: 'Opublikowany', value: 'published' },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'metaTitle', type: 'text', label: 'Tytuł meta' },
        { name: 'metaDescription', type: 'textarea', label: 'Opis meta' },
      ],
    },
  ],
}
