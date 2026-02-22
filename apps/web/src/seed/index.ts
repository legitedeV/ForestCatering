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

/* eslint-disable @typescript-eslint/no-explicit-any */
const POSTS: Array<{
  title: string
  slug: string
  excerpt: string
  publishedAt: string
  content: any
}> = [
  {
    title: 'Startujemy z blogiem Forest Catering',
    slug: 'startujemy-z-blogiem-forest-catering',
    excerpt: 'Witamy na blogu Forest Catering! Znajdziesz tu przepisy, porady i inspiracje kulinarne.',
    publishedAt: '2024-01-15T10:00:00.000Z',
    content: {
      root: {
        type: 'root',
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'heading',
            tag: 'h2',
            version: 1,
            direction: 'ltr',
            format: '',
            indent: 0,
            children: [
              { type: 'text', text: 'Witamy w naszym blogu!', format: 0, version: 1, detail: 0, mode: 'normal', style: '' },
            ],
          },
          {
            type: 'paragraph',
            version: 1,
            direction: 'ltr',
            format: '',
            indent: 0,
            children: [
              { type: 'text', text: 'Z ogromną przyjemnością ogłaszamy start bloga ', format: 0, version: 1, detail: 0, mode: 'normal', style: '' },
              { type: 'text', text: 'Forest Catering', format: 1, version: 1, detail: 0, mode: 'normal', style: '' },
              { type: 'text', text: '. Będziemy tu dzielić się przepisami, poradami i inspiracjami kulinarnymi.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' },
            ],
          },
          {
            type: 'heading',
            tag: 'h3',
            version: 1,
            direction: 'ltr',
            format: '',
            indent: 0,
            children: [
              { type: 'text', text: 'Co znajdziesz na blogu?', format: 0, version: 1, detail: 0, mode: 'normal', style: '' },
            ],
          },
          {
            type: 'list',
            listType: 'bullet',
            tag: 'ul',
            version: 1,
            direction: 'ltr',
            format: '',
            indent: 0,
            start: 1,
            children: [
              { type: 'listitem', value: 1, version: 1, direction: 'ltr', format: '', indent: 0, children: [{ type: 'text', text: 'Przepisy i inspiracje kulinarne', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
              { type: 'listitem', value: 2, version: 1, direction: 'ltr', format: '', indent: 0, children: [{ type: 'text', text: 'Porady dotyczące organizacji imprez', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
              { type: 'listitem', value: 3, version: 1, direction: 'ltr', format: '', indent: 0, children: [{ type: 'text', text: 'Nowości z oferty Forest Catering', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
            ],
          },
          {
            type: 'heading',
            tag: 'h3',
            version: 1,
            direction: 'ltr',
            format: '',
            indent: 0,
            children: [
              { type: 'text', text: 'Jak zamawiać?', format: 0, version: 1, detail: 0, mode: 'normal', style: '' },
            ],
          },
          {
            type: 'list',
            listType: 'number',
            tag: 'ol',
            version: 1,
            direction: 'ltr',
            format: '',
            indent: 0,
            start: 1,
            children: [
              { type: 'listitem', value: 1, version: 1, direction: 'ltr', format: '', indent: 0, children: [{ type: 'text', text: 'Wybierz danie z naszej oferty', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
              { type: 'listitem', value: 2, version: 1, direction: 'ltr', format: '', indent: 0, children: [{ type: 'text', text: 'Skontaktuj się z nami telefonicznie lub przez formularz', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
              { type: 'listitem', value: 3, version: 1, direction: 'ltr', format: '', indent: 0, children: [{ type: 'text', text: 'Ustalamy szczegóły i termin dostawy', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
            ],
          },
          {
            type: 'paragraph',
            version: 1,
            direction: 'ltr',
            format: '',
            indent: 0,
            children: [
              { type: 'text', text: 'Sprawdź naszą pełną ofertę na stronie ', format: 0, version: 1, detail: 0, mode: 'normal', style: '' },
              {
                type: 'link',
                version: 3,
                direction: 'ltr',
                format: '',
                indent: 0,
                fields: { url: 'https://forestcatering.pl/oferta', newTab: true, linkType: 'custom' },
                children: [{ type: 'text', text: 'forestcatering.pl/oferta', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }],
              },
              { type: 'text', text: '.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' },
            ],
          },
          {
            type: 'quote',
            version: 1,
            direction: 'ltr',
            format: '',
            indent: 0,
            children: [
              { type: 'text', text: 'Jedzenie to nie tylko pożywienie — to doświadczenie, które łączy ludzi.', format: 2, version: 1, detail: 0, mode: 'normal', style: '' },
            ],
          },
          {
            type: 'paragraph',
            version: 1,
            direction: 'ltr',
            format: '',
            indent: 0,
            children: [
              { type: 'text', text: 'Aby dowiedzieć się więcej, użyj komendy ', format: 0, version: 1, detail: 0, mode: 'normal', style: '' },
              { type: 'text', text: 'npm run seed', format: 16, version: 1, detail: 0, mode: 'code', style: '' },
              { type: 'text', text: ' aby załadować przykładowe dane.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' },
            ],
          },
        ],
      },
    },
  },
  {
    title: 'Jak zaplanować catering na event firmowy',
    slug: 'jak-zaplanowac-catering-na-event-firmowy',
    excerpt: 'Organizujesz event firmowy? Dowiedz się jak zaplanować catering, by każdy gość był zadowolony.',
    publishedAt: '2024-02-01T10:00:00.000Z',
    content: {
      root: {
        type: 'root',
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'heading',
            tag: 'h2',
            version: 1,
            direction: 'ltr',
            format: '',
            indent: 0,
            children: [
              { type: 'text', text: 'Planowanie cateringu firmowego krok po kroku', format: 0, version: 1, detail: 0, mode: 'normal', style: '' },
            ],
          },
          {
            type: 'paragraph',
            version: 1,
            direction: 'ltr',
            format: '',
            indent: 0,
            children: [
              { type: 'text', text: 'Organizacja cateringu na event firmowy to zadanie wymagające ', format: 0, version: 1, detail: 0, mode: 'normal', style: '' },
              { type: 'text', text: 'starannego planowania', format: 1, version: 1, detail: 0, mode: 'normal', style: '' },
              { type: 'text', text: ' i koordynacji. Poniżej znajdziesz ', format: 0, version: 1, detail: 0, mode: 'normal', style: '' },
              { type: 'text', text: 'praktyczne wskazówki', format: 2, version: 1, detail: 0, mode: 'normal', style: '' },
              { type: 'text', text: ', które ułatwią Ci to zadanie.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' },
            ],
          },
          {
            type: 'heading',
            tag: 'h3',
            version: 1,
            direction: 'ltr',
            format: '',
            indent: 0,
            children: [
              { type: 'text', text: 'Kluczowe pytania przed zamówieniem', format: 0, version: 1, detail: 0, mode: 'normal', style: '' },
            ],
          },
          {
            type: 'list',
            listType: 'bullet',
            tag: 'ul',
            version: 1,
            direction: 'ltr',
            format: '',
            indent: 0,
            start: 1,
            children: [
              { type: 'listitem', value: 1, version: 1, direction: 'ltr', format: '', indent: 0, children: [{ type: 'text', text: 'Ile osób weźmie udział w evencie?', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
              { type: 'listitem', value: 2, version: 1, direction: 'ltr', format: '', indent: 0, children: [{ type: 'text', text: 'Jakie są wymagania dietetyczne uczestników?', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
              { type: 'listitem', value: 3, version: 1, direction: 'ltr', format: '', indent: 0, children: [{ type: 'text', text: 'Jaki budżet przewidujesz na catering?', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
              { type: 'listitem', value: 4, version: 1, direction: 'ltr', format: '', indent: 0, children: [{ type: 'text', text: 'Czy potrzebujesz obsługi kelnerskiej?', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
            ],
          },
          {
            type: 'quote',
            version: 1,
            direction: 'ltr',
            format: '',
            indent: 0,
            children: [
              { type: 'text', text: 'Dobry catering to inwestycja w atmosferę eventu i zadowolenie uczestników.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' },
            ],
          },
          {
            type: 'paragraph',
            version: 1,
            direction: 'ltr',
            format: '',
            indent: 0,
            children: [
              { type: 'text', text: 'Skontaktuj się z nami przez ', format: 0, version: 1, detail: 0, mode: 'normal', style: '' },
              {
                type: 'link',
                version: 3,
                direction: 'ltr',
                format: '',
                indent: 0,
                fields: { url: 'https://forestcatering.pl/kontakt', newTab: false, linkType: 'custom' },
                children: [{ type: 'text', text: 'formularz kontaktowy', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }],
              },
              { type: 'text', text: ', aby omówić szczegóły Twojego eventu.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' },
            ],
          },
        ],
      },
    },
  },
]
/* eslint-enable @typescript-eslint/no-explicit-any */

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

  // Ensure media directory exists
  fs.mkdirSync(MEDIA_DIR, { recursive: true })

  // --- Seed categories and products (skip if any products exist) ---
  const existingProducts = await payload.find({ collection: 'products', limit: 1 })
  if (existingProducts.totalDocs > 0) {
    console.log('✅ Products already exist — skipping products/categories seed.')
  } else {
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
  }

  // --- Seed blog posts (idempotent per slug) ---
  console.log('📝 Seeding blog posts…')
  for (const post of POSTS) {
    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: post.slug } },
      limit: 1,
    })
    if (existing.totalDocs > 0) {
      console.log(`   ⏭ Post already exists: ${post.title}`)
      continue
    }
    await payload.create({
      collection: 'posts',
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        status: 'published',
        publishedAt: post.publishedAt,
      },
    })
    console.log(`   ✓ Post: ${post.title}`)
  }

  console.log('🎉 Seed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
