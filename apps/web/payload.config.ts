import path from 'path';
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { fileURLToPath } from 'url';

import { Users } from './src/payload/collections/Users.ts';
import { Media } from './src/payload/collections/Media.ts';
import { Products } from './src/payload/collections/Products.ts';
import { Categories } from './src/payload/collections/Categories.ts';
import { ServiceTypes } from './src/payload/collections/ServiceTypes.ts';
import { EventPackages } from './src/payload/collections/EventPackages.ts';
import { Leads } from './src/payload/collections/Leads.ts';
import { Orders } from './src/payload/collections/Orders.ts';
import { Testimonials } from './src/payload/collections/Testimonials.ts';
import { GalleryItems } from './src/payload/collections/GalleryItems.ts';
import { SiteSettings } from './src/payload/globals/SiteSettings.ts';

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

// Dynamic import to avoid @lexical/* top-level await breaking
// Node.js require() in the tsx CJS register hook used by `payload migrate`.
export default (async () => {
  const { lexicalEditor } = await import('@payloadcms/richtext-lexical');

  return buildConfig({
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
    secret: process.env.PAYLOAD_SECRET!,
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
})();
