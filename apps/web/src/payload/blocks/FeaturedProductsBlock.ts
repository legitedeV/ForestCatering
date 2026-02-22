import type { Block } from 'payload'

export const FeaturedProductsBlock: Block = {
  slug: 'featuredProducts',
  labels: { singular: 'Wyróżnione produkty', plural: 'Wyróżnione produkty' },
  fields: [
    { name: 'heading', type: 'text', label: 'Nagłówek' },
    { name: 'limit', type: 'number', defaultValue: 6, label: 'Limit produktów' },
    { name: 'linkText', type: 'text', label: 'Tekst linku' },
    { name: 'linkUrl', type: 'text', label: 'URL linku' },
  ],
}
