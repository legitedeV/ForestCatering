import { isAdmin } from '../access/isAdmin'
import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Ustawienia strony',
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    { name: 'companyName', type: 'text', defaultValue: 'Forest Catering', label: 'Nazwa firmy' },
    { name: 'phone', type: 'text', label: 'Telefon' },
    { name: 'email', type: 'email', label: 'E-mail' },
    {
      name: 'address',
      type: 'group',
      label: 'Adres',
      fields: [
        { name: 'street', type: 'text', label: 'Ulica' },
        { name: 'city', type: 'text', defaultValue: 'Szczecin', label: 'Miasto' },
        { name: 'postalCode', type: 'text', label: 'Kod pocztowy' },
      ],
    },
    {
      name: 'socialLinks',
      type: 'group',
      label: 'Social media',
      fields: [
        { name: 'facebook', type: 'text', label: 'Facebook' },
        { name: 'instagram', type: 'text', label: 'Instagram' },
      ],
    },
    { name: 'businessHours', type: 'textarea', label: 'Godziny otwarcia' },
    {
      name: 'minOrderAmount',
      type: 'number',
      defaultValue: 5000,
      label: 'Minimalna kwota zamówienia',
      admin: { description: 'W groszach (5000 = 50 PLN)' },
    },
    {
      name: 'deliveryFee',
      type: 'number',
      defaultValue: 1500,
      label: 'Opłata za dostawę',
      admin: { description: 'W groszach (1500 = 15 PLN)' },
    },
    {
      name: 'freeDeliveryThreshold',
      type: 'number',
      defaultValue: 15000,
      label: 'Darmowa dostawa od',
      admin: { description: 'W groszach (15000 = 150 PLN)' },
    },
    {
      name: 'seoDefaults',
      type: 'group',
      label: 'Domyślne SEO',
      fields: [
        { name: 'metaTitle', type: 'text', label: 'Tytuł meta' },
        { name: 'metaDescription', type: 'textarea', label: 'Opis meta' },
        { name: 'ogImage', type: 'upload', relationTo: 'media', label: 'Domyślny obraz OG' },
      ],
    },
  ],
}
