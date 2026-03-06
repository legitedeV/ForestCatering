import type { GlobalConfig } from 'payload';

import { isAdmin } from '../access/isAdmin.ts';
import { isAdminOrEditor } from '../access/isAdminOrEditor.ts';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Ogólne',
          fields: [
            {
              name: 'siteName',
              type: 'text',
              defaultValue: 'Forest Hub',
            },
            {
              name: 'siteDescription',
              type: 'textarea',
            },
          ],
        },
        {
          label: 'Kontakt',
          fields: [
            {
              name: 'phone',
              type: 'text',
            },
            {
              name: 'email',
              type: 'email',
            },
            {
              name: 'address',
              type: 'text',
            },
            {
              name: 'city',
              type: 'text',
            },
            {
              name: 'zipCode',
              type: 'text',
            },
          ],
        },
        {
          label: 'Social Media',
          fields: [
            {
              name: 'facebook',
              type: 'text',
            },
            {
              name: 'instagram',
              type: 'text',
            },
            {
              name: 'tiktok',
              type: 'text',
            },
          ],
        },
        {
          label: 'Godziny otwarcia',
          fields: [
            {
              name: 'hours',
              type: 'array',
              fields: [
                {
                  name: 'day',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'openTime',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'e.g. 08:00',
                  },
                },
                {
                  name: 'closeTime',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'e.g. 22:00',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
