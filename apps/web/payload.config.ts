import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { Products } from './src/payload/collections/Products'
import { Categories } from './src/payload/collections/Categories'
import { Orders } from './src/payload/collections/Orders'
import { EventPackages } from './src/payload/collections/EventPackages'
import { Leads } from './src/payload/collections/Leads'
import { Pages } from './src/payload/collections/Pages'
import { Posts } from './src/payload/collections/Posts'
import { GalleryItems } from './src/payload/collections/GalleryItems'
import { Media } from './src/payload/collections/Media'
import { Users } from './src/payload/collections/Users'
import { SiteSettings } from './src/payload/globals/SiteSettings'
import { Navigation } from './src/payload/globals/Navigation'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  collections: [
    Products,
    Categories,
    Orders,
    EventPackages,
    Leads,
    Pages,
    Posts,
    GalleryItems,
    Media,
    Users,
  ],
  globals: [SiteSettings, Navigation],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
})
