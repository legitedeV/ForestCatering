import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { pl } from '@payloadcms/translations/languages/pl'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

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
import { navigationImportEndpoint } from './src/payload/endpoints/navigationImport'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const hasSmtpConfig = Boolean(process.env.SMTP_HOST)

const emailAdapter = hasSmtpConfig
  ? nodemailerAdapter({
      defaultFromAddress: process.env.SMTP_FROM || 'kontakt@forestbar.pl',
      defaultFromName: 'ForestCatering',
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
    })
  : undefined

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  localization: {
    locales: ['pl'],
    defaultLocale: 'pl',
    fallback: true,
  },
  editor: lexicalEditor(),
  db: postgresAdapter({
    migrationDir: path.resolve(dirname, 'src/migrations'),
    pool: {
      connectionString: process.env.DATABASE_URL || process.env.DATABASE_URI || '',
    },
  }),
  i18n: {
    supportedLanguages: { pl },
    fallbackLanguage: 'pl',
  },
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
  endpoints: [navigationImportEndpoint],
  secret: process.env.PAYLOAD_SECRET || '',
  email: emailAdapter,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },
  admin: {
    user: Users.slug,
    dateFormat: 'dd.MM.yyyy',
    meta: {
      titleSuffix: ' - Forest Catering CMS',
      description: 'Panel administracyjny Forest Catering',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
})
