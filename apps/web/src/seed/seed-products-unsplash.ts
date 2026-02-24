import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const MEDIA_DIR = path.resolve(__dirname, '../../public/media')

type CategorySeed = {
  name: string
  slug: string
  description: string
}

type ProductSeed = {
  name: string
  slug: string
  shortDescription: string
  price: number
  compareAtPrice?: number
  categorySlug: 'catering' | 'snacki-imprezowe' | 'slodkie'
  isFeatured: boolean
  unsplashId: string
  color: string
}

const CATEGORIES: CategorySeed[] = [
  { name: 'Catering', slug: 'catering', description: 'Usługi cateringowe na każdą okazję.' },
  { name: 'Snacki imprezowe', slug: 'snacki-imprezowe', description: 'Finger food i przekąski na eventy i domówki.' },
  { name: 'Słodkie', slug: 'slodkie', description: 'Desery i słodkie przekąski na imprezy.' },
]

const PRODUCTS: ProductSeed[] = [
  { name: 'Mini burgery wołowe', slug: 'mini-burgery-wolowe', shortDescription: 'Soczyste mini burgery z cheddarem i piklami.', price: 3299, compareAtPrice: 3799, categorySlug: 'snacki-imprezowe', isFeatured: true, unsplashId: 'pFYxHKPG0z0', color: '#8E4B3C' },
  { name: 'Tortille z kurczakiem', slug: 'tortille-z-kurczakiem', shortDescription: 'Roladki tortilla z grillowanym kurczakiem i warzywami.', price: 2899, categorySlug: 'catering', isFeatured: true, unsplashId: 'q82DzK9qo7Y', color: '#6E8B3D' },
  { name: 'Koreczki premium', slug: 'koreczki-premium', shortDescription: 'Koreczki z serami dojrzewającymi i winogronami.', price: 2599, categorySlug: 'snacki-imprezowe', isFeatured: true, unsplashId: 'zm1c2nrX8rg', color: '#7B5A48' },
  { name: 'Deska finger food', slug: 'deska-finger-food', shortDescription: 'Mix przekąsek imprezowych w formie finger food.', price: 4499, compareAtPrice: 4999, categorySlug: 'snacki-imprezowe', isFeatured: true, unsplashId: '3ZTF8_zVIeU', color: '#4E6A52' },
  { name: 'Mini tarty warzywne', slug: 'mini-tarty-warzywne', shortDescription: 'Kruche mini tarty ze szpinakiem i fetą.', price: 2699, categorySlug: 'catering', isFeatured: true, unsplashId: 'JK1Iog4H4u0', color: '#6A7A4F' },
  { name: 'Wrapy wegetariańskie', slug: 'wrapy-wegetarianskie', shortDescription: 'Kolorowe wrapy z hummusem i świeżymi warzywami.', price: 2799, categorySlug: 'catering', isFeatured: false, unsplashId: 'irpHVBQ8xfE', color: '#4E7E68' },
  { name: 'Kanapeczki bankietowe', slug: 'kanapeczki-bankietowe', shortDescription: 'Eleganckie mini kanapeczki na pieczywie rzemieślniczym.', price: 2399, categorySlug: 'snacki-imprezowe', isFeatured: false, unsplashId: 'EK9FWSXIS3k', color: '#8B6C42' },
  { name: 'Szaszłyki caprese', slug: 'szaszlyki-caprese', shortDescription: 'Mozzarella, pomidorki i bazylia z glazurą balsamiczną.', price: 2499, categorySlug: 'snacki-imprezowe', isFeatured: false, unsplashId: '-kn5n-Xdopc', color: '#7D4A40' },
  { name: 'Skrzydełka BBQ', slug: 'skrzydelka-bbq', shortDescription: 'Pikantne skrzydełka pieczone w sosie barbecue.', price: 3199, categorySlug: 'catering', isFeatured: false, unsplashId: 'RUy4bRXrkxw', color: '#7C3F2B' },
  { name: 'Kulki serowe z ziołami', slug: 'kulki-serowe-z-ziolami', shortDescription: 'Aromatyczne kuleczki serowe z mieszanką świeżych ziół.', price: 2199, categorySlug: 'snacki-imprezowe', isFeatured: false, unsplashId: 'iP6ZoS0c1Sw', color: '#667E48' },
  { name: 'Mini quiche lorraine', slug: 'mini-quiche-lorraine', shortDescription: 'Francuskie tartaletki z boczkiem i porami.', price: 2999, categorySlug: 'catering', isFeatured: false, unsplashId: 'OhyYhWU7HKE', color: '#8A6846' },
  { name: 'Nachosy z dipami', slug: 'nachosy-z-dipami', shortDescription: 'Chrupiące nachosy podawane z trzema domowymi dipami.', price: 1999, categorySlug: 'snacki-imprezowe', isFeatured: false, unsplashId: 'rqj5GFN3XRg', color: '#B07A3A' },
  { name: 'Brownie bites', slug: 'brownie-bites', shortDescription: 'Czekoladowe mini brownie z chrupiącą skórką.', price: 2299, categorySlug: 'slodkie', isFeatured: false, unsplashId: 'e4gkH3ZshF8', color: '#5A3B30' },
  { name: 'Mini ptysie waniliowe', slug: 'mini-ptysie-waniliowe', shortDescription: 'Ptysie z kremem waniliowym i delikatną polewą.', price: 2499, categorySlug: 'slodkie', isFeatured: false, unsplashId: 'cgQwuizxv9g', color: '#C19A6B' },
  { name: 'Owocowe szaszłyki', slug: 'owocowe-szaszlyki', shortDescription: 'Świeże owoce sezonowe w wygodnej formie finger food.', price: 2199, categorySlug: 'slodkie', isFeatured: false, unsplashId: 'JYYv8xHvmBc', color: '#6F8F6B' },
  { name: 'Makaroniki mix', slug: 'makaroniki-mix', shortDescription: 'Francuskie makaroniki o różnych smakach i kolorach.', price: 3399, compareAtPrice: 3799, categorySlug: 'slodkie', isFeatured: false, unsplashId: 'aXSf0vf-nYs', color: '#B57FA0' },
  { name: 'Mini desery w pucharkach', slug: 'mini-desery-w-pucharkach', shortDescription: 'Warstwowe deserki: tiramisu, mango i truskawka.', price: 2899, categorySlug: 'slodkie', isFeatured: false, unsplashId: 'GmF5cGIE3DA', color: '#9A6A52' },
  { name: 'Croissanty koktajlowe', slug: 'croissanty-koktajlowe', shortDescription: 'Maślane mini croissanty z nadzieniem wytrawnym.', price: 2799, categorySlug: 'catering', isFeatured: false, unsplashId: 'eW-d8O6a-DM', color: '#A27B47' },
  { name: 'Rogaliki z łososiem', slug: 'rogaliki-z-lososiem', shortDescription: 'Delikatne rogaliki z łososiem wędzonym i serkiem.', price: 3599, compareAtPrice: 3999, categorySlug: 'catering', isFeatured: false, unsplashId: 'aNTUUfPOGOA', color: '#6E5A6F' },
  { name: 'Mini bezy z kremem', slug: 'mini-bezy-z-kremem', shortDescription: 'Chrupiace bezy z lekkim kremem śmietankowym i owocami.', price: 2399, categorySlug: 'slodkie', isFeatured: false, unsplashId: 'UBtRdqWUbzc', color: '#BFAF86' },
]

function isTruthy(value: string | undefined): boolean {
  return value === '1' || value === 'true' || value === 'yes'
}

async function fetchWithRetry(url: string, tries = 3): Promise<Buffer> {
  let lastError: unknown

  for (let attempt = 1; attempt <= tries; attempt += 1) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`)
      }
      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (error) {
      lastError = error
      if (attempt < tries) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 500))
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Unknown fetch error')
}

async function generateFallbackJpeg(label: string, color: string): Promise<Buffer> {
  const safeLabel = label
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

  const svg = `<svg width="1600" height="1067" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="64" fill="white" text-anchor="middle" dominant-baseline="middle">${safeLabel}</text></svg>`

  return sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toBuffer()
}

async function buildImage(product: ProductSeed): Promise<Buffer> {
  const unsplashUrl = `https://images.unsplash.com/photo-${product.unsplashId}?auto=format&fit=crop&w=1600&q=80`

  try {
    const downloaded = await fetchWithRetry(unsplashUrl)
    return sharp(downloaded).jpeg({ quality: 84 }).toBuffer()
  } catch {
    return generateFallbackJpeg(product.name, product.color)
  }
}

async function seedProductsUnsplash() {
  if (!process.env.DATABASE_URI || !process.env.PAYLOAD_SECRET) {
    throw new Error('DATABASE_URI and PAYLOAD_SECRET are required')
  }

  const forceSeed = isTruthy(process.env.SEED_FORCE)
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
    const imageBuffer = await buildImage(product)
    const fileName = `${product.slug}.jpg`
    const filePath = path.join(MEDIA_DIR, fileName)
    fs.writeFileSync(filePath, imageBuffer)

    const mediaExisting = await payload.find({ collection: 'media', where: { alt: { equals: product.name } }, limit: 1 })
    const media = mediaExisting.docs[0]
      ? mediaExisting.docs[0]
      : await payload.create({
        collection: 'media',
        data: { alt: product.name },
        filePath,
        file: {
          data: imageBuffer,
          name: fileName,
          mimetype: 'image/jpeg',
          size: imageBuffer.length,
        },
      })

    const data = {
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      price: product.price,
      ...(product.compareAtPrice ? { compareAtPrice: product.compareAtPrice } : {}),
      category: categoryMap[product.categorySlug],
      images: [{ image: media.id }],
      productType: 'catering' as const,
      isAvailable: true,
      isFeatured: product.isFeatured,
      sortOrder: 0,
    }

    const existingProduct = await payload.find({ collection: 'products', where: { slug: { equals: product.slug } }, limit: 1 })
    if (existingProduct.docs[0]) {
      if (forceSeed) {
        await payload.update({ collection: 'products', id: existingProduct.docs[0].id, data })
      }
      continue
    }

    await payload.create({ collection: 'products', data })
  }
}

seedProductsUnsplash()
  .then(() => {
    console.log('✅ Seed produktów Unsplash zakończony sukcesem')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Seed produktów Unsplash nie powiódł się:', error)
    process.exit(1)
  })
