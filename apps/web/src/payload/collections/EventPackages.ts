import type { CollectionConfig } from 'payload';

import { isAdminOrEditor } from '../access/isAdminOrEditor';

export const EventPackages: CollectionConfig = {
  slug: 'event-packages',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'serviceType',
      type: 'relationship',
      relationTo: 'service-types',
    },
    {
      name: 'priceFrom',
      type: 'number',
      admin: {
        description: 'Minimum price in grosz',
      },
    },
    {
      name: 'priceTo',
      type: 'number',
      admin: {
        description: 'Maximum price in grosz',
      },
    },
    {
      name: 'features',
      type: 'array',
      fields: [
        {
          name: 'feature',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'highlighted',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
  ],
};
