import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import payload from 'payload'
import payloadConfig from '../payload.config'

type UploadRef = number | { id: number }

async function download(url: string, filename: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download failed ${res.status} ${url}`)
  const ab = await res.arrayBuffer()
  const buf = Buffer.from(ab)

  const filePath = path.join(os.tmpdir(), filename)
  await fs.writeFile(filePath, buf)

  const ct = (res.headers.get('content-type') || '').toLowerCase()
  const mime = ct.includes('image/') ? ct.split(';')[0] : 'image/jpeg'
  return { filePath, mime }
}

async function createMediaFromUrl(url: string, alt: string): Promise<UploadRef> {
  const safe = alt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const filename = `${safe || 'image'}-${Date.now()}.jpg`
  const { filePath, mime } = await download(url, filename)
  const data = await fs.readFile(filePath)

  const created = await payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data,
      name: filename,
      mimetype: mime,
      size: data.length,
    } as any,
  })

  return created.id
}

async function run() {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET || '',
    config: payloadConfig as any,
    local: true,
  })

  const dumpValidation = (err: any) => {
    const e = err?.data?.errors || err?.cause?.errors
    if (e) console.error('VALIDATION_ERRORS:', JSON.stringify(e, null, 2))
  }

  // idempotent: usuń istniejącą stronę o slug=bar
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'bar' } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs?.[0]) {
    await payload.delete({ collection: 'pages', id: existing.docs[0].id })
  }

  // 6 obrazów do pełnej galerii (wymagane)
  const gallery = [
    { alt: 'Wesela', url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80' },
    { alt: 'Eventy firmowe', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80' },
    { alt: 'Catering prywatny', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80' },
    { alt: 'Obsluga baru', url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1600&q=80' },
    { alt: 'Dekoracje', url: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=1600&q=80' },
    { alt: 'Menu degustacyjne', url: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=1600&q=80' },
  ]

  const mediaIds: number[] = []
  for (const g of gallery) {
    const id = (await createMediaFromUrl(g.url, g.alt)) as number
    mediaIds.push(id)
  }

  const data: any = {
    title: 'Forest Bar',
    slug: 'bar',
    path: '/',
    _status: 'published',
    sections: [
      {
        blockType: 'hero',
        heading: 'Wysmienity catering na kazda okazje',
        subheading: 'Eventy firmowe � Wesela � Catering prywatny � Obsluga baru',
        badge: 'Catering premium w Szczecinie',
        ctaText: 'Zamow catering',
        ctaLink: '/sklep',
        secondaryCtaText: 'Zapytaj o event',
        secondaryCtaLink: '/kontakt',
        showScrollIndicator: true,
        fullHeight: true,
      },
      {
        blockType: 'stats',
        items: [
          { value: 500, suffix: '+', label: 'Zrealizowanych eventow' },
          { value: 10, suffix: '+', label: 'Lat doswiadczenia' },
          { value: 50, suffix: '+', label: 'Pozycji w menu' },
          { value: 100, suffix: '%', label: 'Zadowolonych klientow' },
        ],
      },
      {
        blockType: 'services',
        heading: 'Czym sie zajmujemy',
        items: [
          {
            emoji: '🍽️',
            title: 'Catering firmowy',
            description: 'Profesjonalna obsluga spotkan biznesowych, konferencji i codziennych dostaw do biura.',
            link: '/oferta',
          },
          {
            emoji: '🎉',
            title: 'Eventy prywatne',
            description: 'Kompleksowa obsluga imprez okolicznosciowych, urodzin i przyjec w plenerze.',
            link: '/eventy',
          },
          {
            emoji: '💒',
            title: 'Wesela',
            description: 'Wyjatkowe menu weselne dopasowane do Waszych potrzeb i stylu uroczystosci.',
            link: '/eventy',
          },
          {
            emoji: '🍸',
            title: 'Obsluga baru',
            description: 'Mobilny bar z profesjonalnymi barmanami, autorskimi koktajlami i pokazami.',
            link: '/eventy',
          },
        ],
      },
      {
        blockType: 'featuredProducts',
        heading: 'Nasze bestsellery',
        limit: 6,
        linkText: 'Zobacz caly sklep ->',
        linkUrl: '/sklep',
      },
      {
        blockType: 'about',
        badge: 'O Forest Catering',
        heading: 'Gotujemy z pasja od ponad 10 lat',
        highlights: [
          { text: 'Swieze lokalne skladniki' },
          { text: 'Reczne przygotowanie' },
          { text: 'Indywidualne menu' },
          { text: 'Doswiadczony zespol' },
        ],
        ctaText: 'Poznaj nasza oferte',
        ctaLink: '/oferta',
      },
      {
        blockType: 'galleryFull',
        heading: 'Nasze realizacje',
        items: [
          { image: mediaIds[0], alt: 'Wesela', category: 'wesela', categoryLabel: 'Wesela' },
          { image: mediaIds[1], alt: 'Eventy firmowe', category: 'eventy-firmowe', categoryLabel: 'Eventy firmowe' },
          { image: mediaIds[2], alt: 'Catering prywatny', category: 'catering-prywatny', categoryLabel: 'Catering prywatny' },
          { image: mediaIds[3], alt: 'Obsluga baru', category: 'obsluga-baru', categoryLabel: 'Obsluga baru' },
          { image: mediaIds[4], alt: 'Dekoracje', category: 'dekoracje', categoryLabel: 'Dekoracje' },
          { image: mediaIds[5], alt: 'Menu degustacyjne', category: 'menu-degustacyjne', categoryLabel: 'Menu degustacyjne' },
        ],
      },
      {
        blockType: 'testimonials',
        heading: 'Co mowia nasi klienci',
        items: [
          {
            quote: 'Forest Catering zapewnil niesamowite jedzenie na nasze wesele. Goscie do dzis wspominaja te dania!',
            author: 'Anna i Marcin',
            event: 'Wesele',
            rating: 5,
          },
          {
            quote: 'Profesjonalne podejscie, elastycznosc i pyszne jedzenie. Staly partner naszej firmy.',
            author: 'Tomasz K.',
            event: 'Catering firmowy',
            rating: 5,
          },
          {
            quote: 'Obsluga baru na naszym evencie firmowym byla na najwyzszym poziomie!',
            author: 'Marta W.',
            event: 'Event firmowy',
            rating: 5,
          },
        ],
      },
      {
        blockType: 'cta',
        heading: 'Zamow catering juz dzis',
        text: 'Odpowiadamy w ciagu 24h. Bezplatna wycena.',
        phoneNumber: '+48 123 456 789',
        buttonText: 'Napisz do nas',
        buttonLink: '/kontakt',
        secondaryButtonText: 'Zadzwon',
        secondaryButtonLink: 'tel:+48123456789',
        variant: 'primary',
      },
    ],
  }

  try {
    const created = await payload.create({ collection: 'pages', data })
    console.log('SEED_OK pageId=', created.id, 'slug=bar path=/')
    process.exit(0)
  } catch (err: any) {
    console.error('SEED_FAIL:', err?.message || err)
    dumpValidation(err)
    process.exit(1)
  }
}

run().catch((err) => {
  console.error('SEED_CRASH:', err?.message || err)
  process.exit(1)
})
