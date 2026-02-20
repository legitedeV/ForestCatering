import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { sendLeadNotificationToAdmin } from '../hooks/sendLeadNotification'

export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Zapytanie', plural: 'Zapytania' },
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
    { name: 'name', type: 'text', required: true, label: 'Imię i nazwisko' },
    { name: 'email', type: 'email', required: true, label: 'E-mail' },
    { name: 'phone', type: 'text', label: 'Telefon' },
    {
      name: 'eventType',
      type: 'select',
      label: 'Typ wydarzenia',
      options: [
        { label: 'Catering firmowy', value: 'catering-firmowy' },
        { label: 'Wesele', value: 'wesele' },
        { label: 'Event prywatny', value: 'event-prywatny' },
        { label: 'Bar', value: 'bar' },
        { label: 'Catering + Bar', value: 'catering-plus-bar' },
        { label: 'Inne', value: 'inne' },
      ],
    },
    { name: 'eventDate', type: 'date', label: 'Data wydarzenia' },
    { name: 'guestCount', type: 'number', min: 1, label: 'Liczba gości' },
    { name: 'budget', type: 'text', label: 'Budżet' },
    { name: 'message', type: 'textarea', required: true, label: 'Wiadomość' },
    { name: 'selectedPackage', type: 'relationship', relationTo: 'event-packages', label: 'Wybrany pakiet' },
    { name: 'source', type: 'text', defaultValue: 'contact-form', label: 'Źródło' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      label: 'Status',
      options: [
        { label: 'Nowe', value: 'new' },
        { label: 'Skontaktowano', value: 'contacted' },
        { label: 'Wycenione', value: 'quoted' },
        { label: 'Wygrane', value: 'won' },
        { label: 'Przegrane', value: 'lost' },
      ],
    },
    {
      name: 'convertedToOrder',
      type: 'relationship',
      relationTo: 'orders',
      label: 'Powiązane zamówienie',
      admin: { position: 'sidebar' },
    },
  ],
}
