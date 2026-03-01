import type { Block } from 'payload'
import { visualEditorFields } from '../fields/visual-editor-fields'

export const ContactFormBlock: Block = {
  slug: 'contactForm',
  labels: { singular: 'Formularz kontaktowy', plural: 'Formularze kontaktowe' },
  fields: [
    { name: 'heading', type: 'text', label: 'Nagłówek sekcji' },
    { name: 'subheading', type: 'textarea', label: 'Podnagłówek' },
    ...visualEditorFields(),
  ],
}
