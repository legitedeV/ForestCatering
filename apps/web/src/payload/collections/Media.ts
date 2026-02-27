import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAdmin } from '../access/isAdmin'
import { generateAutoSlug } from '../hooks/generateAutoSlug'

const mediaStaticDir = process.env.PAYLOAD_MEDIA_ROOT?.trim() || 'public/media'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Plik', plural: 'Media' },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [
      generateAutoSlug({
        slugField: 'imageSlug',
        sourceFields: ['title', 'alt', 'originalFilename'],
        fallbackPrefix: 'image',
      }),
    ],
  },
  upload: {
    // Allow overriding the on-disk path in production standalone runtime
    // (PM2 cwd points to .next/standalone/apps/web).
    staticDir: mediaStaticDir,
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumbnail', width: 300, height: 300, position: 'centre' },
      { name: 'card', width: 600, height: 400, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
    ],
  },
  fields: [
    { name: 'alt', type: 'text', required: true, label: 'Opis alternatywny (alt)' },
    {
      name: 'imageSlug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug obrazka',
      admin: { position: 'sidebar' },
    },
  ],
}
