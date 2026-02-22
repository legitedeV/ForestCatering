import path from 'path'
import fs from 'fs'
import { getPayload } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const MEDIA_DIR = path.resolve(__dirname, '../../public/media')

const CATEGORIES = [
  { name: 'Catering', slug: 'catering', description: 'Usługi cateringowe na każdą okazję' },
  { name: 'Eventy', slug: 'eventy', description: 'Pakiety eventowe i okolicznościowe' },
  { name: 'Bar', slug: 'bar', description: 'Napoje i przekąski barowe' },
] as const

const PRODUCTS: Array<{
  name: string
  slug: string
  shortDescription: string
  price: number
  compareAtPrice?: number
  productType: 'catering'
  category: string
  color: string
  isFeatured: boolean
}> = [
  { name: 'Zestaw lunchowy Classic', slug: 'zestaw-lunchowy-classic', shortDescription: 'Klasyczny zestaw lunchowy z zupą dnia i daniem głównym.', price: 3599, productType: 'catering', category: 'catering', color: '#4a7c59', isFeatured: true },
  { name: 'Zestaw lunchowy Premium', slug: 'zestaw-lunchowy-premium', shortDescription: 'Premium zestaw lunchowy z przystawką, zupą i deserem.', price: 5499, compareAtPrice: 6299, productType: 'catering', category: 'catering', color: '#2d5a3d', isFeatured: true },
]

const POSTS: Array<{ title: string; slug: string; excerpt: string; content: Record<string, unknown> }> = [
  {
    title: 'Startujemy z blogiem Forest Catering',
    slug: 'startujemy-z-blogiem-forest-catering',
    excerpt: 'Poznaj kulisy naszej pracy i inspiracje kulinarne.',
    content: {
      root: {
        type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: [
          { type: 'heading', tag: 'h2', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Dlaczego uruchomiliśmy blog?', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [
            { type: 'text', text: 'Będziemy publikować ', format: 0, version: 1, detail: 0, mode: 'normal', style: '' },
            { type: 'text', text: 'praktyczne porady', format: 1, version: 1, detail: 0, mode: 'normal', style: '' },
            { type: 'text', text: ' i inspiracje dla organizatorów wydarzeń.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' },
          ] },
          { type: 'list', listType: 'bullet', start: 1, format: '', indent: 0, version: 1, direction: 'ltr', children: [
            { type: 'listitem', value: 1, format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'menu sezonowe', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
            { type: 'listitem', value: 2, format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'organizacja eventów', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
          ] },
        ],
      },
    },
  },
  {
    title: 'Formatowanie: nagłówki, listy i cytaty',
    slug: 'formatowanie-naglowki-listy-cytaty',
    excerpt: 'Wpis testowy do E2E dla rich text.',
    content: {
      root: {
        type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: [
          { type: 'heading', tag: 'h2', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Test renderowania rich text', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'To jest ', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }, { type: 'text', text: 'pogrubienie', format: 1, version: 1, detail: 0, mode: 'normal', style: '' }] },
        ],
      },
    },
  },
]

async function generatePlaceholder(label: string, color: string): Promise<Buffer> {
  const safeLabel = label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&apos;').replace(/"/g, '&quot;')
  const svg = `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="50%" font-family="sans-serif" font-size="28" fill="white" text-anchor="middle" dominant-baseline="middle">${safeLabel}</text></svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

async function seed() {
  if (!process.env.DATABASE_URI || !process.env.PAYLOAD_SECRET) throw new Error('DATABASE_URI and PAYLOAD_SECRET are required')

  fs.mkdirSync(MEDIA_DIR, { recursive: true })
  const configPath = path.resolve(__dirname, '../../payload.config.ts')
  const payload = await getPayload({ config: (await import(configPath)).default })

  const categoryMap: Record<string, number> = {}
  for (const category of CATEGORIES) {
    const existing = await payload.find({ collection: 'categories', where: { slug: { equals: category.slug } }, limit: 1 })
    const doc = existing.docs[0]
      ? await payload.update({ collection: 'categories', id: existing.docs[0].id, data: category })
      : await payload.create({ collection: 'categories', data: category })
    categoryMap[category.slug] = Number(doc.id)
  }

  for (const product of PRODUCTS) {
    const imgBuffer = await generatePlaceholder(product.name, product.color)
    const filename = `${product.slug}.png`
    const filePath = path.join(MEDIA_DIR, filename)
    fs.writeFileSync(filePath, imgBuffer)

    const mediaExisting = await payload.find({ collection: 'media', where: { alt: { equals: product.name } }, limit: 1 })
    const media = mediaExisting.docs[0]
      ? mediaExisting.docs[0]
      : await payload.create({ collection: 'media', data: { alt: product.name }, filePath, file: { data: imgBuffer, name: filename, mimetype: 'image/png', size: imgBuffer.length } })

    const existing = await payload.find({ collection: 'products', where: { slug: { equals: product.slug } }, limit: 1 })
    const data = {
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      price: product.price,
      ...(product.compareAtPrice ? { compareAtPrice: product.compareAtPrice } : {}),
      category: categoryMap[product.category],
      images: [{ image: media.id }],
      productType: product.productType,
      isAvailable: true,
      isFeatured: product.isFeatured,
      sortOrder: 0,
    }

    if (existing.docs[0]) {
      await payload.update({ collection: 'products', id: existing.docs[0].id, data })
    } else {
      await payload.create({ collection: 'products', data })
    }
  }

  for (const post of POSTS) {
    const existing = await payload.find({ collection: 'posts', where: { slug: { equals: post.slug } }, limit: 1 })
    const data = { title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, status: 'published' as const, publishedAt: new Date().toISOString() }
    if (existing.docs[0]) {
      await payload.update({ collection: 'posts', id: existing.docs[0].id, data: data as never })
    } else {
      await payload.create({ collection: 'posts', data: data as never })
    }
  }

  console.log('✅ Seed complete')
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})
