import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { populateSlug } from '../hooks/populateSlug'
import { revalidatePages } from '../hooks/revalidatePages'
import { computePagePath } from '../hooks/computePagePath'
import { HeroBlock } from '../blocks/Hero'
import { RichTextBlock } from '../blocks/RichText'
import { GalleryBlock } from '../blocks/Gallery'
import { CTABlock } from '../blocks/CTA'
import { FAQBlock } from '../blocks/FAQ'
import { StatsBlock } from '../blocks/StatsBlock'
import { ServicesBlock } from '../blocks/ServicesBlock'
import { FeaturedProductsBlock } from '../blocks/FeaturedProductsBlock'
import { AboutBlock } from '../blocks/AboutBlock'
import { TestimonialsBlock } from '../blocks/TestimonialsBlock'
import { PricingBlock } from '../blocks/PricingBlock'
import { StepsBlock } from '../blocks/StepsBlock'
import { ContactFormBlock } from '../blocks/ContactFormBlock'
import { LegalTextBlock } from '../blocks/LegalTextBlock'
import { GalleryFullBlock } from '../blocks/GalleryFullBlock'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Strona', plural: 'Strony' },
  defaultPopulate: {
    title: true,
    slug: true,
    path: true,
    parent: true,
    sortOrder: true,
    updatedAt: true,
    createdAt: true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'path', 'slug', 'parent', 'sortOrder', 'updatedAt'],
    preview: (doc) => {
      const pagePath = (doc?.path || doc?.slug) as string
      if (!pagePath) return ''
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const secret = process.env.PAYLOAD_PREVIEW_SECRET || ''
      return `${baseUrl}/api/preview?secret=${secret}&path=${pagePath}`
    },
    livePreview: {
      url: ({ data }) => {
        const pagePath = (data?.path || data?.slug) as string
        if (!pagePath) return ''
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        return pagePath === 'home' ? baseUrl : `${baseUrl}/${pagePath}`
      },
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
  hooks: {
    beforeValidate: [populateSlug, computePagePath],
    afterChange: [revalidatePages],
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
      name: 'path',
      type: 'text',
      unique: true,
      index: true,
      label: 'Path',
      admin: { readOnly: true, position: 'sidebar', description: 'Wyliczane automatycznie z parent/slug.' },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      maxDepth: 1,
      label: 'Strona nadrzędna',
      admin: {
        description: 'Wybierz stronę nadrzędną (opcjonalnie).',
      },
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0, label: 'Kolejność', admin: { position: 'sidebar' } },
    {
      name: 'sections',
      type: 'blocks',
      label: 'Sekcje',
      required: true,
      minRows: 1,
      blocks: [
        HeroBlock,
        StatsBlock,
        ServicesBlock,
        FeaturedProductsBlock,
        AboutBlock,
        RichTextBlock,
        GalleryBlock,
        GalleryFullBlock,
        TestimonialsBlock,
        CTABlock,
        FAQBlock,
        PricingBlock,
        StepsBlock,
        ContactFormBlock,
        LegalTextBlock,
      ],
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
