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

  // ─── Pages (home) ────────────────────────────────────────────
  const homeSlug = process.env.HOME_PAGE_SLUG || 'home'
  const homeSections = [
    {
      blockType: 'hero',
      heading: 'Wyśmienity catering na każdą okazję',
      subheading: 'Eventy firmowe · Wesela · Catering prywatny · Obsługa baru',
      badge: '🌿 Premium Catering Szczecin',
      ctaText: 'Zamów catering',
      ctaLink: '/sklep',
      secondaryCtaText: 'Zapytaj o event',
      secondaryCtaLink: '/kontakt',
      showScrollIndicator: true,
      fullHeight: true,
    },
    {
      blockType: 'stats',
      items: [
        { value: 500, suffix: '+', label: 'Zrealizowanych eventów' },
        { value: 10, suffix: '+', label: 'Lat doświadczenia' },
        { value: 50, suffix: '+', label: 'Pozycji w menu' },
        { value: 100, suffix: '%', label: 'Zadowolonych klientów' },
      ],
    },
    {
      blockType: 'services',
      heading: 'Czym się zajmujemy',
      items: [
        { emoji: '🍽️', title: 'Catering firmowy', description: 'Profesjonalna obsługa spotkań biznesowych, konferencji i codziennych dostaw do biura.', link: '/oferta' },
        { emoji: '🎉', title: 'Eventy prywatne', description: 'Kompleksowa obsługa imprez okolicznościowych, urodzin i przyjęć w plenerze.', link: '/eventy' },
        { emoji: '💒', title: 'Wesela', description: 'Wyjątkowe menu weselne dopasowane do Waszych potrzeb i stylu uroczystości.', link: '/eventy' },
        { emoji: '🍸', title: 'Obsługa baru', description: 'Mobilny bar z profesjonalnymi barmanami, autorskimi koktajlami i pokazami.', link: '/eventy' },
      ],
    },
    {
      blockType: 'featuredProducts',
      heading: 'Nasze bestsellery',
      limit: 6,
      linkText: 'Zobacz cały sklep →',
      linkUrl: '/sklep',
    },
    {
      blockType: 'about',
      badge: 'O Forest Catering',
      heading: 'Gotujemy z pasją od ponad 10 lat',
      content: {
        root: {
          type: 'root',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: [
            {
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              direction: 'ltr',
              children: [{
                type: 'text',
                text: 'Forest Catering to zespół doświadczonych kucharzy i pasjonatów dobrego jedzenia ze Szczecina. Specjalizujemy się w cateringu eventowym, firmowym i weselnym, zawsze stawiając na najwyższą jakość składników i indywidualne podejście do każdego klienta.',
                format: 0,
                version: 1,
                detail: 0,
                mode: 'normal',
                style: '',
              }],
            },
            {
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              direction: 'ltr',
              children: [{
                type: 'text',
                text: 'Współpracujemy z lokalnymi dostawcami, korzystamy z sezonowych składników i przygotowujemy wszystko ręcznie — od pieczywa po desery. Każde zamówienie traktujemy jak wyzwanie, któremu chcemy sprostać na najwyższym poziomie.',
                format: 0,
                version: 1,
                detail: 0,
                mode: 'normal',
                style: '',
              }],
            },
          ],
        },
      },
      highlights: [
        { text: 'Świeże lokalne składniki' },
        { text: 'Ręczne przygotowanie' },
        { text: 'Indywidualne menu' },
        { text: 'Doświadczony zespół' },
      ],
      ctaText: 'Poznaj naszą ofertę',
      ctaLink: '/oferta',
    },
    {
      blockType: 'testimonials',
      heading: 'Co mówią nasi klienci',
      items: [
        { quote: 'Forest Catering zapewnił niesamowite jedzenie na nasze wesele. Goście do dziś wspominają te dania!', author: 'Anna i Marcin', event: 'Wesele', rating: 5 },
        { quote: 'Profesjonalne podejście, elastyczność i pyszne jedzenie. Stały partner naszej firmy.', author: 'Tomasz K.', event: 'Catering firmowy', rating: 5 },
        { quote: 'Obsługa baru na naszym evencie firmowym była na najwyższym poziomie!', author: 'Marta W.', event: 'Event firmowy', rating: 5 },
      ],
    },
    {
      blockType: 'cta',
      heading: 'Gotowy na niezapomniane wydarzenie?',
      text: 'Odpowiadamy w ciągu 24h. Bezpłatna wycena.',
      buttonText: 'Napisz do nas',
      buttonLink: '/kontakt',
      variant: 'primary',
      phoneNumber: '+48123456789',
      secondaryButtonText: 'Zadzwoń',
      secondaryButtonLink: 'tel:+48123456789',
    },
  ]

  const pagesData = [
    {
      title: 'Forest Catering — Strona główna',
      slug: homeSlug,
      sortOrder: 0,
      _status: 'published' as const,
      sections: homeSections,
      seo: {
        metaTitle: 'Forest Catering — Catering premium w Szczecinie',
        metaDescription: 'Profesjonalny catering eventowy, firmowy i weselny w Szczecinie. Świeże lokalne składniki.',
      },
    },
    {
      title: 'Oferta',
      slug: 'oferta',
      sortOrder: 10,
      _status: 'published' as const,
      sections: [
        {
          blockType: 'hero',
          heading: 'Nasza oferta',
          subheading: 'Dopasujemy catering do Twoich potrzeb',
          badge: 'Pakiety i wycena',
          ctaText: 'Zapytaj o wycenę',
          ctaLink: '/kontakt',
        },
        {
          blockType: 'pricing',
          heading: 'Pakiety cateringowe',
          packages: [
            { name: 'Catering firmowy', price: 'od 45 zł/os.', featured: false, ctaText: 'Zapytaj o wycenę', ctaLink: '/kontakt?event=catering-firmowy', features: [{ text: 'Śniadania i lunche' }, { text: 'Menu sezonowe' }, { text: 'Dostawa do biura' }] },
            { name: 'Catering eventowy', price: 'od 85 zł/os.', featured: false, ctaText: 'Zapytaj o wycenę', ctaLink: '/kontakt?event=event-prywatny', features: [{ text: 'Catering na 20-500 osób' }, { text: 'Serwis kelnerski' }, { text: 'Dekoracje stołów' }] },
            { name: 'Catering + Bar', price: 'od 120 zł/os.', featured: true, ctaText: 'Zapytaj o wycenę', ctaLink: '/kontakt?event=catering-plus-bar', features: [{ text: 'Profesjonalni barmani' }, { text: 'Koktajle autorskie' }, { text: 'Pokazy barmańskie' }] },
          ],
        },
      ],
    },
    {
      title: 'Eventy',
      slug: 'eventy',
      sortOrder: 20,
      _status: 'published' as const,
      sections: [
        {
          blockType: 'hero',
          heading: 'Obsługa eventów',
          subheading: 'Kompleksowa organizacja kulinarna wydarzeń prywatnych i firmowych',
          ctaText: 'Umów konsultację',
          ctaLink: '/kontakt?event=event-prywatny',
        },
        {
          blockType: 'pricing',
          heading: 'Pakiety eventowe',
          packages: [
            { name: 'BASIC', price: 'od 85 zł/os.', ctaText: 'Wybieram Basic', ctaLink: '/kontakt?pakiet=basic', features: [{ text: 'Dostawa i serwis' }, { text: 'Menu do wyboru' }] },
            { name: 'PREMIUM', price: 'od 120 zł/os.', featured: true, ctaText: 'Wybieram Premium', ctaLink: '/kontakt?pakiet=premium', features: [{ text: 'Menu degustacyjne' }, { text: 'Serwis premium' }] },
            { name: 'CATERING + BAR', price: 'od 160 zł/os.', ctaText: 'Wybieram Bar', ctaLink: '/kontakt?pakiet=bar', features: [{ text: 'Mobilny bar' }, { text: 'Obsługa barmanów' }] },
          ],
        },
        {
          blockType: 'steps',
          heading: 'Jak to działa?',
          steps: [
            { emoji: '1️⃣', title: 'Kontakt i potrzeby', description: 'Opowiedz nam o wydarzeniu i budżecie.' },
            { emoji: '2️⃣', title: 'Oferta i degustacja', description: 'Przygotowujemy propozycję menu i harmonogram.' },
            { emoji: '3️⃣', title: 'Realizacja', description: 'Dostarczamy catering i obsługujemy event na miejscu.' },
          ],
        },
      ],
    },
    {
      title: 'Galeria',
      slug: 'galeria',
      sortOrder: 30,
      _status: 'published' as const,
      sections: [
        { blockType: 'hero', heading: 'Galeria realizacji', subheading: 'Zobacz nasze ostatnie realizacje eventowe i cateringowe' },
        { blockType: 'galleryFull', heading: 'Nasze realizacje', items: [] },
      ],
    },
    {
      title: 'Kontakt',
      slug: 'kontakt',
      sortOrder: 40,
      _status: 'published' as const,
      sections: [
        {
          blockType: 'contactForm',
          heading: 'Kontakt',
          subheading: 'Napisz do nas — odpowiemy w ciągu 24h',
        },
      ],
    },
    {
      title: 'Regulamin',
      slug: 'regulamin',
      sortOrder: 50,
      _status: 'published' as const,
      sections: [
        {
          blockType: 'legalText',
          heading: 'Regulamin',
          effectiveDate: '2026-02-19',
          content: {
            root: {
              type: 'root',
              format: '',
              indent: 0,
              version: 1,
              direction: 'ltr',
              children: [
                { type: 'heading', tag: 'h2', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: '§1 Postanowienia ogólne', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
                { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Sklep internetowy Forest Catering prowadzi sprzedaż produktów cateringowych oraz usług eventowych za pośrednictwem sieci Internet.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
                { type: 'heading', tag: 'h2', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: '§2 Reklamacje', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
                { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Klient ma prawo złożyć reklamację drogą mailową lub telefoniczną. Reklamacje są rozpatrywane w terminie 14 dni roboczych.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
              ],
            },
          },
        },
      ],
    },
  ]

  let homePageId: string | number | undefined

  for (const pageData of pagesData) {
    const existingPage = await payload.find({ collection: 'pages', where: { slug: { equals: pageData.slug } }, limit: 1 })

    if (existingPage.docs[0]) {
      const updated = await payload.update({ collection: 'pages', id: existingPage.docs[0].id, data: pageData as never })
      if (pageData.slug === homeSlug) {
        homePageId = updated.id
      }
    } else {
      const created = await payload.create({ collection: 'pages', data: pageData as never })
      if (pageData.slug === homeSlug) {
        homePageId = created.id
      }
    }
  }

  if (homePageId) {
    for (const childSlug of ['oferta', 'eventy', 'galeria', 'kontakt', 'regulamin']) {
      const existingPage = await payload.find({ collection: 'pages', where: { slug: { equals: childSlug } }, limit: 1 })
      if (existingPage.docs[0]) {
        await payload.update({
          collection: 'pages',
          id: existingPage.docs[0].id,
          data: { parent: homePageId } as never,
        })
      }
    }
  }


  const galleryMedia = await payload.find({ collection: 'media', limit: 12, sort: '-createdAt' })
  if (galleryMedia.docs.length) {
    const galleryPage = await payload.find({ collection: 'pages', where: { slug: { equals: 'galeria' } }, limit: 1, depth: 0 })
    if (galleryPage.docs[0]) {
      await payload.update({
        collection: 'pages',
        id: galleryPage.docs[0].id,
        data: {
          sections: [
            { blockType: 'hero', heading: 'Galeria realizacji', subheading: 'Zobacz nasze ostatnie realizacje eventowe i cateringowe' },
            {
              blockType: 'galleryFull',
              heading: 'Nasze realizacje',
              items: galleryMedia.docs.map((media, index) => ({
                image: media.id,
                alt: media.alt || `Realizacja ${index + 1}`,
                category: index % 2 === 0 ? 'eventy-firmowe' : 'catering-prywatny',
                categoryLabel: index % 2 === 0 ? 'Eventy firmowe' : 'Catering prywatny',
              })),
            },
          ],
        } as never,
      })
    }
  }

  console.log('✅ Seed complete')
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})
