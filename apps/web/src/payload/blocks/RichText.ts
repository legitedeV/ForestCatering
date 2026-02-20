import type { Block } from 'payload'

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Blok tekstowy', plural: 'Bloki tekstowe' },
  fields: [
    { name: 'content', type: 'richText', required: true, label: 'Treść' },
  ],
}
