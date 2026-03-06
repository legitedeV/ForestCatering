import path from 'path';
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { fileURLToPath } from 'url';

import { Users } from './src/payload/collections/Users';
import { Media } from './src/payload/collections/Media';
import { Products } from './src/payload/collections/Products';
import { Categories } from './src/payload/collections/Categories';
import { ServiceTypes } from './src/payload/collections/ServiceTypes';
import { EventPackages } from './src/payload/collections/EventPackages';
import { Leads } from './src/payload/collections/Leads';
import { Orders } from './src/payload/collections/Orders';
import { Testimonials } from './src/payload/collections/Testimonials';
import { GalleryItems } from './src/payload/collections/GalleryItems';
import { SiteSettings } from './src/payload/globals/SiteSettings';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

if (!process.env.PAYLOAD_SECRET) {
  throw new Error(
    'PAYLOAD_SECRET environment variable is required. ' +
      'Generate one with: openssl rand -hex 32',
  );
}

if (!process.env.DATABASE_URI) {
  throw new Error(
    'DATABASE_URI environment variable is required. ' +
      'Example: postgresql://user:pass@localhost:5432/foresthub',
  );
}

export default buildConfig({
  editor: lexicalEditor(),
  collections: [
    Users,
    Media,
    Products,
    Categories,
    ServiceTypes,
    EventPackages,
    Leads,
    Orders,
    Testimonials,
    GalleryItems,
  ],
  globals: [SiteSettings],
  secret: process.env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload/payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),
  admin: {
    user: Users.slug,
  },
});
