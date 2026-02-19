import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  fields: [
    { name: 'companyName', type: 'text', defaultValue: 'Forest Catering' },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'street', type: 'text' },
        { name: 'city', type: 'text', defaultValue: 'Szczecin' },
        { name: 'postalCode', type: 'text' },
      ],
    },
    {
      name: 'socialLinks',
      type: 'group',
      fields: [
        { name: 'facebook', type: 'text' },
        { name: 'instagram', type: 'text' },
      ],
    },
    { name: 'businessHours', type: 'textarea' },
    {
      name: 'minOrderAmount',
      type: 'number',
      defaultValue: 5000,
      admin: { description: 'Minimalna kwota zamówienia w groszach (5000 = 50 PLN)' },
    },
    {
      name: 'deliveryFee',
      type: 'number',
      defaultValue: 1500,
      admin: { description: 'Opłata za dostawę w groszach (1500 = 15 PLN)' },
    },
    {
      name: 'freeDeliveryThreshold',
      type: 'number',
      defaultValue: 15000,
      admin: { description: 'Darmowa dostawa od... w groszach (15000 = 150 PLN)' },
    },
    {
      name: 'seoDefaults',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
      ],
    },
  ],
}
