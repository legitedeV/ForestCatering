import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const LegalTextBlock: Block = {
  slug: 'legalText',
  labels: { singular: 'Treść prawna', plural: 'Treści prawne' },
  fields: [
    { name: 'heading', type: 'text', label: 'Nagłówek' },
    { name: 'effectiveDate', type: 'date', label: 'Data obowiązywania' },
    { name: 'content', type: 'richText', required: true, editor: lexicalEditor({}) },
  ],
}
