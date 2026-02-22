import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { populateSlug } from '../hooks/populateSlug'
import { HeroBlock } from '../blocks/Hero'
import { RichTextBlock } from '../blocks/RichText'
import { GalleryBlock } from '../blocks/Gallery'
import { CTABlock } from '../blocks/CTA'
import { FAQBlock } from '../blocks/FAQ'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Strona', plural: 'Strony' },
  admin: { useAsTitle: 'title' },
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
  hooks: {
    beforeValidate: [populateSlug],
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Tytuł' },
    { name: 'slug', type: 'text', required: true, unique: true, label: 'Slug (URL)' },
    {
      name: 'sections',
      type: 'blocks',
      label: 'Sekcje',
      required: true,
      minRows: 1,
      blocks: [HeroBlock, RichTextBlock, GalleryBlock, CTABlock, FAQBlock],
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'metaTitle', type: 'text', maxLength: 60, label: 'Tytuł meta' },
        { name: 'metaDescription', type: 'textarea', maxLength: 160, label: 'Opis meta' },
        { name: 'ogImage', type: 'upload', relationTo: 'media', label: 'Obrazek OG (social media)' },
      ],
    },
  ],
}
