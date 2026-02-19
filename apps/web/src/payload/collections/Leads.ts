import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { sendLeadNotificationToAdmin } from '../hooks/sendLeadNotification'

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'eventType', 'status', 'createdAt'],
  },
  access: {
    read: isAdminOrEditor,
    create: () => true,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [sendLeadNotificationToAdmin],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    {
      name: 'eventType',
      type: 'select',
      options: [
        'catering-firmowy',
        'wesele',
        'event-prywatny',
        'bar',
        'catering-plus-bar',
        'inne',
      ],
    },
    { name: 'eventDate', type: 'date' },
    { name: 'guestCount', type: 'number', min: 1 },
    { name: 'budget', type: 'text' },
    { name: 'message', type: 'textarea', required: true },
    { name: 'selectedPackage', type: 'relationship', relationTo: 'event-packages' },
    { name: 'source', type: 'text', defaultValue: 'contact-form' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: ['new', 'contacted', 'quoted', 'won', 'lost'],
    },
    {
      name: 'convertedToOrder',
      type: 'relationship',
      relationTo: 'orders',
      admin: { position: 'sidebar' },
    },
  ],
}
