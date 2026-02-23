import type { Block } from 'payload'

export const ContactFormBlock: Block = {
  slug: 'contactForm',
  labels: { singular: 'Formularz kontaktowy', plural: 'Formularze kontaktowe' },
  fields: [
    { name: 'heading', type: 'text', label: 'Nagłówek sekcji' },
    { name: 'subheading', type: 'textarea', label: 'Podnagłówek' },
  ],
}
