import type { CollectionConfig } from 'payload';

import { isAdmin } from '../access/isAdmin.ts';
import { isAdminOrEditor } from '../access/isAdminOrEditor.ts';

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: isAdminOrEditor,
    create: () => true,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'serviceType',
      type: 'relationship',
      relationTo: 'service-types',
    },
    {
      name: 'eventDate',
      type: 'date',
    },
    {
      name: 'guestCount',
      type: 'number',
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'Nowy', value: 'new' },
        { label: 'Skontaktowano', value: 'contacted' },
        { label: 'Skonwertowano', value: 'converted' },
        { label: 'Zamknięty', value: 'closed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes – not visible to the customer',
      },
    },
  ],
};
