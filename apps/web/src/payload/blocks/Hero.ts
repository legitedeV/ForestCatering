import type { Block } from 'payload'
import { visualEditorFields } from '../fields/visual-editor-fields'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Baner główny', plural: 'Banery główne' },
  fields: [
    { name: 'heading', type: 'text', required: true, label: 'Nagłówek' },
    { name: 'subheading', type: 'text', label: 'Podtytuł' },
    { name: 'backgroundImage', type: 'upload', relationTo: 'media', label: 'Zdjęcie tła' },
    { name: 'ctaText', type: 'text', label: 'Tekst przycisku' },
    { name: 'ctaLink', type: 'text', label: 'Link przycisku' },
    { name: 'badge', type: 'text', label: 'Badge (np. 🌲 Catering premium w Szczecinie)' },
    { name: 'secondaryCtaText', type: 'text', label: 'Tekst drugiego przycisku' },
    { name: 'secondaryCtaLink', type: 'text', label: 'Link drugiego przycisku' },
    { name: 'showScrollIndicator', type: 'checkbox', defaultValue: true, label: 'Pokaż wskaźnik przewijania' },
    { name: 'fullHeight', type: 'checkbox', defaultValue: false, label: 'Pełna wysokość ekranu' },
    ...visualEditorFields(),
  ],
}
