import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { isAdmin } from '../access/isAdmin'
import { generateAutoSlug } from '../hooks/generateAutoSlug'

const mediaStaticDir = process.env.PAYLOAD_MEDIA_ROOT?.trim() || 'public/media'

const toPublicMediaPath = (url: string): string => {
  if (url.startsWith('/api/media/file/')) {
    return url.replace('/api/media/file/', '/media/')
  }

  try {
    const parsed = new URL(url)
    if (parsed.pathname.startsWith('/api/media/file/')) {
      parsed.pathname = parsed.pathname.replace('/api/media/file/', '/media/')
      return `${parsed.pathname}${parsed.search}`
    }
  } catch {
    // noop: already a relative URL
  }

  return url
}

const rewriteMediaResponseUrls = ({ doc }: { doc: Record<string, unknown> }): Record<string, unknown> => {
  if (typeof doc.url === 'string') {
    doc.url = toPublicMediaPath(doc.url)
  }

  if (typeof doc.thumbnailURL === 'string') {
    doc.thumbnailURL = toPublicMediaPath(doc.thumbnailURL)
  }

  if (doc.sizes && typeof doc.sizes === 'object') {
    const sizes = doc.sizes as Record<string, unknown>

    for (const size of Object.values(sizes)) {
      if (!size || typeof size !== 'object') continue
      const typedSize = size as Record<string, unknown>
      if (typeof typedSize.url === 'string') {
        typedSize.url = toPublicMediaPath(typedSize.url)
      }
    }
  }

  return doc
}

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
    afterRead: [rewriteMediaResponseUrls],
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
