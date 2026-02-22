/**
 * Seed script — populates the database with sample categories, media, and products.
 *
 * Usage:  cd apps/web && npx tsx src/seed/index.ts
 * Or:     cd apps/web && npm run seed
 *
 * Idempotent: skips seeding when products already exist.
 * Works offline: generates placeholder PNG images with sharp (no HTTP calls).
 */

import path from 'path'
import fs from 'fs'
import { getPayload } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/* ------------------------------------------------------------------ */
/*  Configuration                                                      */
/* ------------------------------------------------------------------ */

const MEDIA_DIR = path.resolve(__dirname, '../../public/media')

const CATEGORIES = [
  { name: 'Catering', slug: 'catering', description: 'Usługi cateringowe na każdą okazję' },
  { name: 'Eventy', slug: 'eventy', description: 'Pakiety eventowe i okolicznościowe' },
  { name: 'Bar', slug: 'bar', description: 'Napoje i przekąski barowe' },
] as const

const PRODUCTS = [
  {
    name: 'Zestaw lunchowy Classic',
    slug: 'zestaw-lunchowy-classic',
    shortDescription: 'Klasyczny zestaw lunchowy z zupą dnia i daniem głównym.',
    price: 3599,
    productType: 'catering' as const,
    category: 'catering',
    color: '#4a7c59',
    isFeatured: true,
  },
  {
    name: 'Zestaw lunchowy Premium',
    slug: 'zestaw-lunchowy-premium',
    shortDescription: 'Premium zestaw lunchowy z przystawką, zupą i deserem.',
    price: 5499,
    compareAtPrice: 6299,
    productType: 'catering' as const,
    category: 'catering',
    color: '#2d5a3d',
    isFeatured: true,
  },
  {
    name: 'Pakiet eventowy Standard',
    slug: 'pakiet-eventowy-standard',
    shortDescription: 'Kompletny pakiet cateringowy na eventy do 50 osób.',
    price: 8999,
    productType: 'event' as const,
    category: 'eventy',
    color: '#6b8f71',
    isFeatured: true,
  },
  {
    name: 'Pakiet eventowy VIP',
    slug: 'pakiet-eventowy-vip',
    shortDescription: 'Ekskluzywny catering eventowy z obsługą kelnerską.',
    price: 14999,
    productType: 'event' as const,
    category: 'eventy',
    color: '#3d6b4f',
    isFeatured: true,
  },
  {
    name: 'Lemoniada leśna',
    slug: 'lemoniada-lesna',
    shortDescription: 'Orzeźwiająca lemoniada z miętą i owocami leśnymi.',
    price: 1499,
    productType: 'bar' as const,
    category: 'bar',
    color: '#7fa87f',
    isFeatured: true,
  },
  {
    name: 'Deska serów rzemieślniczych',
    slug: 'deska-serow-rzemieslniczych',
    shortDescription: 'Wybór polskich serów rzemieślniczych z dodatkami.',
    price: 4299,
    productType: 'bar' as const,
    category: 'bar',
    color: '#5c8a5c',
    isFeatured: true,
  },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Generate a simple 600×400 placeholder PNG with the product name. */
async function generatePlaceholder(label: string, color: string): Promise<Buffer> {
  const width = 600
  const height = 400
  // Escape XML special chars for the SVG text node
  const safeLabel = label
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;')

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${color}"/>
    <text x="50%" y="50%" font-family="sans-serif" font-size="28" fill="white"
          text-anchor="middle" dominant-baseline="middle">${safeLabel}</text>
  </svg>`

  return sharp(Buffer.from(svg)).png().toBuffer()
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

async function seed() {
  console.log('🌱 Starting seed…')

  // Ensure PAYLOAD_SECRET and DATABASE_URI are available
  if (!process.env.DATABASE_URI) {
    console.error('❌ DATABASE_URI env var is required.')
    process.exit(1)
  }
  if (!process.env.PAYLOAD_SECRET) {
    console.error('❌ PAYLOAD_SECRET env var is required.')
    process.exit(1)
  }

  const configPath = path.resolve(__dirname, '../../payload.config.ts')
  const payload = await getPayload({ config: (await import(configPath)).default })

  // Idempotency check — skip if products exist
  const existing = await payload.find({ collection: 'products', limit: 1 })
  if (existing.totalDocs > 0) {
    console.log('✅ Products already exist — skipping seed.')
    process.exit(0)
  }

  // Ensure media directory exists
  fs.mkdirSync(MEDIA_DIR, { recursive: true })

  // --- Seed categories ---
  console.log('📁 Seeding categories…')
  const categoryMap: Record<string, number> = {}
  for (const cat of CATEGORIES) {
    const created = await payload.create({
      collection: 'categories',
      data: { name: cat.name, slug: cat.slug, description: cat.description },
    })
    categoryMap[cat.slug] = created.id
    console.log(`   ✓ Category: ${cat.name} (id=${created.id})`)
  }

  // --- Seed products with images ---
  console.log('📦 Seeding products…')
  for (const prod of PRODUCTS) {
    // Generate placeholder image and write to disk
    const imgBuffer = await generatePlaceholder(prod.name, prod.color)
    const filename = `${prod.slug}.png`
    const filePath = path.join(MEDIA_DIR, filename)
    fs.writeFileSync(filePath, imgBuffer)

    // Create Media document via Payload Local API (file upload)
    const media = await payload.create({
      collection: 'media',
      data: { alt: prod.name },
      filePath,
      file: {
        data: imgBuffer,
        name: filename,
        mimetype: 'image/png',
        size: imgBuffer.length,
      },
    })

    // Create Product referencing the media and category
    await payload.create({
      collection: 'products',
      data: {
        name: prod.name,
        slug: prod.slug,
        shortDescription: prod.shortDescription,
        price: prod.price,
        ...(prod.compareAtPrice ? { compareAtPrice: prod.compareAtPrice } : {}),
        category: categoryMap[prod.category],
        images: [{ image: media.id }],
        productType: prod.productType,
        isAvailable: true,
        isFeatured: prod.isFeatured,
        sortOrder: 0,
      },
    })
    console.log(`   ✓ Product: ${prod.name}`)
  }

  console.log('🎉 Seed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
