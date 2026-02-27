import { isAdminOrEditor } from '../access/isAdminOrEditor'
import type { GlobalConfig } from 'payload'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Nawigacja',
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'headerItems',
      type: 'array',
      label: 'Menu górne',
      labels: { singular: 'Pozycja menu', plural: 'Pozycje menu' },
      fields: [
        { name: 'label', type: 'text', required: true, label: 'Tekst' },
        { name: 'url', type: 'text', required: true, label: 'Adres URL' },
      ],
    },
    {
      name: 'footerColumns',
      type: 'array',
      label: 'Kolumny stopki',
      labels: { singular: 'Kolumna', plural: 'Kolumny' },
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Tytuł kolumny' },
        {
          name: 'links',
          type: 'array',
          label: 'Linki',
          labels: { singular: 'Link', plural: 'Linki' },
          fields: [
            { name: 'label', type: 'text', required: true, label: 'Tekst' },
            { name: 'url', type: 'text', required: true, label: 'Adres URL' },
          ],
        },
      ],
    },
    {
      name: 'navigationJSONImport',
      type: 'ui',
      admin: {
        components: {
          Field: '/src/payload/admin/components/ImportExportNavigation#ImportExportNavigation',
        },
      },
    },
  ],
}
