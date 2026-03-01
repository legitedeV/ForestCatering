import type { Block } from 'payload'
import { visualEditorFields } from '../fields/visual-editor-fields'

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Blok tekstowy', plural: 'Bloki tekstowe' },
  fields: [
    { name: 'content', type: 'richText', required: true, label: 'Treść' },
    ...visualEditorFields(),
  ],
}
