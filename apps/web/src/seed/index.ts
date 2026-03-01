import path from 'path'
import fs from 'fs'
import { getPayload } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { slugifySafe } from '../payload/lib/slug'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const MEDIA_DIR = path.resolve(__dirname, '../../public/media')

/* ─── helpers ─────────────────────────────────────────────────── */

function isTruthy(value: string | undefined): boolean {
  return value === '1' || value === 'true' || value === 'yes'
}

function richText(paragraphs: string[]) {
  return {
    root: {
      type: 'root', format: '', indent: 0, version: 1, direction: 'ltr',
      children: paragraphs.map((text) => ({
        type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr',
        children: [{ type: 'text', text, format: 0, version: 1, detail: 0, mode: 'normal', style: '' }],
      })),
    },
  }
}

function richTextWithHeadings(sections: Array<{ heading?: string; paragraphs: string[] }>) {
  const children: Record<string, unknown>[] = []
  for (const section of sections) {
    if (section.heading) {
      children.push({
        type: 'heading', tag: 'h2', format: '', indent: 0, version: 1, direction: 'ltr',
        children: [{ type: 'text', text: section.heading, format: 0, version: 1, detail: 0, mode: 'normal', style: '' }],
      })
    }
    for (const text of section.paragraphs) {
      children.push({
        type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr',
        children: [{ type: 'text', text, format: 0, version: 1, detail: 0, mode: 'normal', style: '' }],
      })
    }
  }
  return { root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children } }
}

async function generatePlaceholder(label: string, color: string): Promise<Buffer> {
  const safeLabel = label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&apos;').replace(/"/g, '&quot;')
  const svg = `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="50%" font-family="sans-serif" font-size="28" fill="white" text-anchor="middle" dominant-baseline="middle">${safeLabel}</text></svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

async function seedGlobalIfMissing({ payload, slug, data, force }: { payload: Awaited<ReturnType<typeof getPayload>>; slug: 'navigation' | 'site-settings'; data: Record<string, unknown>; force: boolean }) {
  const existing = (await payload.findGlobal({ slug })) as unknown as Record<string, unknown>
  const hasData = Object.entries(existing).some(([key, value]) => !['id', 'updatedAt', 'createdAt'].includes(key) && value != null && value !== '' && (!Array.isArray(value) || value.length > 0))

  if (force || !hasData) {
    await payload.updateGlobal({ slug, data })
  }
}

/* ─── data ────────────────────────────────────────────────────── */

const CATEGORIES = [
  { name: 'Catering dzienny', slug: 'catering-dzienny', description: 'Codzienne zestawy lunchowe i boxy dietetyczne z dostawą do biura.' },
  { name: 'Catering eventowy', slug: 'catering-eventowy', description: 'Bufety, finger food i serwis kelnerski na eventy i konferencje.' },
  { name: 'Catering weselny', slug: 'catering-weselny', description: 'Kompleksowe menu weselne — od przystawek po tort.' },
  { name: 'Bar mobilny', slug: 'bar-mobilny', description: 'Koktajle autorskie, drinki klasyczne i pokazy barmańskie.' },
  { name: 'Desery i dodatki', slug: 'desery-i-dodatki', description: 'Słodkie akcenty, stacje deserowe i candy bary.' },
  { name: 'Wypożyczalnia', slug: 'wypozyczalnia', description: 'Wypożyczalnia zastawy, sztućców i szkła na eventy i wesela.' },
  { name: 'Zastawa porcelanowa', slug: 'zastawa-porcelanowa', description: 'Porcelana do wypożyczenia: bulionówki, filiżanki, talerze, spodki.' },
  { name: 'Sztućce', slug: 'sztucce', description: 'Sztućce do wypożyczenia: łyżki, noże, widelce w różnych rozmiarach.' },
  { name: 'Kieliszki i szklanki', slug: 'kieliszki-i-szklanki', description: 'Szkło do wypożyczenia: szklanki, kieliszki do wina, szampana i wódki.' },
] as const

const PRODUCTS: Array<{
  name: string
  slug: string
  shortDescription: string
  price: number
  compareAtPrice?: number
  productType: 'catering' | 'event' | 'bar' | 'rental'
  category: string
  color: string
  isFeatured: boolean
  imageUrl: string
  allergens?: string[]
  dietary?: string[]
  weight?: string
  servings?: number
}> = [
  // ── Catering dzienny ──
  {
    name: 'Zestaw lunchowy Classic',
    slug: 'zestaw-lunchowy-classic',
    shortDescription: 'Zupa dnia, drugie danie z mięsem, surówka i napój. Idealny na co dzień.',
    price: 3599,
    productType: 'catering',
    category: 'catering-dzienny',
    color: '#4a7c59',
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
    allergens: ['gluten', 'dairy'],
    weight: '550g',
    servings: 1,
  },
  {
    name: 'Zestaw lunchowy Premium',
    slug: 'zestaw-lunchowy-premium',
    shortDescription: 'Przystawka, zupa kremowa, danie główne i deser dnia. Dla wymagających.',
    price: 5499,
    compareAtPrice: 6299,
    productType: 'catering',
    category: 'catering-dzienny',
    color: '#2d5a3d',
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
    allergens: ['gluten', 'dairy', 'eggs'],
    weight: '750g',
    servings: 1,
  },
  {
    name: 'Box wegetariański',
    slug: 'box-wegetarianski',
    shortDescription: 'Kolorowy zestaw wege: hummus, falafel, sałatka i pita. 100% roślinny.',
    price: 3299,
    productType: 'catering',
    category: 'catering-dzienny',
    color: '#6B8E23',
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
    dietary: ['vegetarian', 'vegan'],
    weight: '480g',
    servings: 1,
  },
  {
    name: 'Box proteinowy Fit',
    slug: 'box-proteinowy-fit',
    shortDescription: 'Grillowany kurczak, ryż brązowy, brokuły i sos jogurtowy. Wysoki protein.',
    price: 3899,
    productType: 'catering',
    category: 'catering-dzienny',
    color: '#5F9EA0',
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop',
    allergens: ['dairy'],
    dietary: ['gluten-free', 'low-carb'],
    weight: '500g',
    servings: 1,
  },
  // ── Catering eventowy ──
  {
    name: 'Bufet bankietowy Standard',
    slug: 'bufet-bankietowy-standard',
    shortDescription: 'Przystawki zimne i ciepłe, 2 dania główne, sałatki. Od 20 osób.',
    price: 8500,
    productType: 'event',
    category: 'catering-eventowy',
    color: '#8B4513',
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&h=400&fit=crop',
    allergens: ['gluten', 'dairy', 'eggs', 'nuts'],
    servings: 1,
  },
  {
    name: 'Bufet bankietowy Premium',
    slug: 'bufet-bankietowy-premium',
    shortDescription: 'Finger food, stacja carving, 3 dania główne, deser. Od 30 osób.',
    price: 12000,
    compareAtPrice: 14000,
    productType: 'event',
    category: 'catering-eventowy',
    color: '#654321',
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
    allergens: ['gluten', 'dairy', 'eggs', 'nuts', 'fish'],
    servings: 1,
  },
  {
    name: 'Finger food party',
    slug: 'finger-food-party',
    shortDescription: 'Zestaw 8 rodzajów kanapek i mini przekąsek. Idealne na networking.',
    price: 6500,
    productType: 'event',
    category: 'catering-eventowy',
    color: '#CD853F',
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=400&fit=crop',
    allergens: ['gluten', 'dairy'],
    servings: 10,
  },
  // ── Catering weselny ──
  {
    name: 'Pakiet weselny Elegance',
    slug: 'pakiet-weselny-elegance',
    shortDescription: 'Pełny serwis weselny: 5 dań, tort, candy bar, serwis kelnerski.',
    price: 18000,
    productType: 'event',
    category: 'catering-weselny',
    color: '#DAA520',
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop',
    allergens: ['gluten', 'dairy', 'eggs', 'nuts'],
    servings: 1,
  },
  {
    name: 'Pakiet weselny Rustic',
    slug: 'pakiet-weselny-rustic',
    shortDescription: 'Styl rustykalny: pieczywo rzemieślnicze, wędliny, sery i grill.',
    price: 14500,
    productType: 'event',
    category: 'catering-weselny',
    color: '#A0522D',
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=400&fit=crop',
    allergens: ['gluten', 'dairy'],
    servings: 1,
  },
  // ── Bar mobilny ──
  {
    name: 'Bar koktajlowy Classic',
    slug: 'bar-koktajlowy-classic',
    shortDescription: 'Profesjonalny barman, 5 koktajli autorskich, barówka mobilna.',
    price: 4500,
    productType: 'bar',
    category: 'bar-mobilny',
    color: '#2F4F4F',
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=400&fit=crop',
  },
  {
    name: 'Bar koktajlowy Premium',
    slug: 'bar-koktajlowy-premium',
    shortDescription: '2 barmanów, pokaz flair, 10 koktajli, lody z azotu, oświetlenie LED.',
    price: 8500,
    compareAtPrice: 9500,
    productType: 'bar',
    category: 'bar-mobilny',
    color: '#191970',
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&h=400&fit=crop',
  },
  {
    name: 'Stacja z lemoniadami',
    slug: 'stacja-z-lemoniadami',
    shortDescription: 'Lemonade bar: 4 smaki domowych lemoniad, świeże owoce, lód.',
    price: 2500,
    productType: 'bar',
    category: 'bar-mobilny',
    color: '#FF8C00',
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1523371054106-bbf80586c38c?w=600&h=400&fit=crop',
    dietary: ['vegan', 'gluten-free'],
  },
  // ── Desery i dodatki ──
  {
    name: 'Candy bar deluxe',
    slug: 'candy-bar-deluxe',
    shortDescription: 'Stacja słodkości: makaroniki, cake popsy, mini tarty, babeczki.',
    price: 3500,
    productType: 'catering',
    category: 'desery-i-dodatki',
    color: '#DB7093',
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=600&h=400&fit=crop',
    allergens: ['gluten', 'dairy', 'eggs', 'nuts'],
  },
  {
    name: 'Tort okolicznościowy',
    slug: 'tort-okolicznosciowy',
    shortDescription: 'Tort na zamówienie: 3 piętra, krem maślany, dekoracja z żywych kwiatów.',
    price: 85000,
    productType: 'catering',
    category: 'desery-i-dodatki',
    color: '#C71585',
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop',
    allergens: ['gluten', 'dairy', 'eggs'],
    servings: 30,
  },
  {
    name: 'Stacja kawowa barista',
    slug: 'stacja-kawowa-barista',
    shortDescription: 'Profesjonalny barista, ekspres ciśnieniowy, latte art, kawa speciality.',
    price: 3000,
    productType: 'bar',
    category: 'desery-i-dodatki',
    color: '#3E2723',
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop',
    allergens: ['dairy'],
  },
  // ── Zastawa porcelanowa ──
  {
    name: 'Bulionówka',
    slug: 'bulionowka',
    shortDescription: 'Elegancka bulionówka porcelanowa do wypożyczenia na eventy i wesela.',
    price: 100,
    productType: 'rental',
    category: 'zastawa-porcelanowa',
    color: '#8B7355',
    isFeatured: true,
    imageUrl: '',
  },
  {
    name: 'Spodek pod filiżankę',
    slug: 'spodek-pod-filizanke',
    shortDescription: 'Porcelanowy spodek pod filiżankę do wypożyczenia.',
    price: 90,
    productType: 'rental',
    category: 'zastawa-porcelanowa',
    color: '#8B7355',
    isFeatured: true,
    imageUrl: '',
  },
  {
    name: 'Filiżanka',
    slug: 'filizanka',
    shortDescription: 'Porcelanowa filiżanka do kawy lub herbaty do wypożyczenia.',
    price: 100,
    productType: 'rental',
    category: 'zastawa-porcelanowa',
    color: '#8B7355',
    isFeatured: true,
    imageUrl: '',
  },
  {
    name: 'Talerz deserowy',
    slug: 'talerz-deserowy',
    shortDescription: 'Porcelanowy talerz deserowy do wypożyczenia na eventy.',
    price: 80,
    productType: 'rental',
    category: 'zastawa-porcelanowa',
    color: '#8B7355',
    isFeatured: true,
    imageUrl: '',
  },
  // ── Sztućce ──
  {
    name: 'Łyżeczka',
    slug: 'lyzeczka',
    shortDescription: 'Elegancka łyżeczka do kawy lub herbaty do wypożyczenia.',
    price: 49,
    productType: 'rental',
    category: 'sztucce',
    color: '#C0C0C0',
    isFeatured: true,
    imageUrl: '',
  },
  {
    name: 'Łyżka',
    slug: 'lyzka',
    shortDescription: 'Klasyczna łyżka stołowa do wypożyczenia na eventy i wesela.',
    price: 59,
    productType: 'rental',
    category: 'sztucce',
    color: '#C0C0C0',
    isFeatured: true,
    imageUrl: '',
  },
  {
    name: 'Nóż',
    slug: 'noz',
    shortDescription: 'Elegancki nóż stołowy do wypożyczenia na eventy i wesela.',
    price: 59,
    productType: 'rental',
    category: 'sztucce',
    color: '#C0C0C0',
    isFeatured: true,
    imageUrl: '',
  },
  {
    name: 'Widelec',
    slug: 'widelec',
    shortDescription: 'Klasyczny widelec stołowy do wypożyczenia na eventy i wesela.',
    price: 59,
    productType: 'rental',
    category: 'sztucce',
    color: '#C0C0C0',
    isFeatured: true,
    imageUrl: '',
  },
  {
    name: 'Widelec przystawkowy',
    slug: 'widelec-przystawkowy',
    shortDescription: 'Widelec przystawkowy do wypożyczenia na eventy.',
    price: 49,
    productType: 'rental',
    category: 'sztucce',
    color: '#C0C0C0',
    isFeatured: true,
    imageUrl: '',
  },
  {
    name: 'Widelec deserowy',
    slug: 'widelec-deserowy',
    shortDescription: 'Widelec deserowy do wypożyczenia na eventy i wesela.',
    price: 39,
    productType: 'rental',
    category: 'sztucce',
    color: '#C0C0C0',
    isFeatured: true,
    imageUrl: '',
  },
  // ── Kieliszki i szklanki ──
  {
    name: 'Szklanka',
    slug: 'szklanka',
    shortDescription: 'Elegancka szklanka do wypożyczenia na eventy i wesela.',
    price: 75,
    productType: 'rental',
    category: 'kieliszki-i-szklanki',
    color: '#B8860B',
    isFeatured: true,
    imageUrl: '',
  },
  {
    name: 'Kieliszek do wódki',
    slug: 'kieliszek-do-wodki',
    shortDescription: 'Kieliszek do wódki do wypożyczenia na eventy i wesela.',
    price: 75,
    productType: 'rental',
    category: 'kieliszki-i-szklanki',
    color: '#B8860B',
    isFeatured: true,
    imageUrl: '',
  },
  {
    name: 'Kieliszek do szampana',
    slug: 'kieliszek-do-szampana',
    shortDescription: 'Kieliszek do szampana do wypożyczenia na eventy i wesela.',
    price: 120,
    productType: 'rental',
    category: 'kieliszki-i-szklanki',
    color: '#B8860B',
    isFeatured: true,
    imageUrl: '',
  },
  {
    name: 'Kieliszek do wina',
    slug: 'kieliszek-do-wina',
    shortDescription: 'Kieliszek do wina do wypożyczenia na eventy i wesela.',
    price: 120,
    productType: 'rental',
    category: 'kieliszki-i-szklanki',
    color: '#B8860B',
    isFeatured: true,
    imageUrl: '',
  },
]

const POSTS = [
  {
    title: 'Jak zaplanować catering na wesele — kompletny poradnik',
    slug: 'jak-zaplanowac-catering-na-wesele',
    excerpt: 'Praktyczny przewodnik po organizacji cateringu weselnego krok po kroku.',
    content: richTextWithHeadings([
      { heading: 'Kiedy zacząć szukać cateringu?', paragraphs: ['Najlepiej rozpocząć poszukiwania 9–12 miesięcy przed ślubem. Popularni cateringowcy mają kalendarze wypełnione nawet rok do przodu, szczególnie w sezonie weselnym (maj–wrzesień).'] },
      { heading: 'Ile jedzenia na osobę?', paragraphs: ['Przyjmuje się, że na jednego gościa potrzeba ok. 600–800 g jedzenia (wliczając przystawki, danie główne i desery). Dodaj 10–15% zapasu na nieprzewidziane sytuacje.'] },
      { heading: 'Degustacja — na co zwrócić uwagę', paragraphs: ['Przed podpisaniem umowy poproś o degustację. Zwróć uwagę na świeżość składników, sposób podania i elastyczność w modyfikowaniu menu. Dobry caterer chętnie dopasuje dania do Waszych preferencji.'] },
    ]),
  },
  {
    title: '5 trendów cateringowych na 2026 rok',
    slug: '5-trendow-cateringowych-2026',
    excerpt: 'Sprawdź, jakie trendy kulinarne będą dominować na eventach w tym roku.',
    content: richTextWithHeadings([
      { heading: '1. Stacje kulinarne live cooking', paragraphs: ['Goście uwielbiają obserwować, jak szef kuchni przygotowuje dania na żywo. Stacje z risotto, taco czy sushi to hit eventów 2026.'] },
      { heading: '2. Zero waste catering', paragraphs: ['Ekologiczne podejście do cateringu — mniej odpadów, lokalne składniki, jadalne opakowania. Trend, który zostaje na dłużej.'] },
      { heading: '3. Koktajle bezalkoholowe premium', paragraphs: ['Mocktaile zyskują na popularności. Profesjonalne drinki bez alkoholu to już standard na eventach, nie tylko opcja zamienna.'] },
      { heading: '4. Kuchnia roślinna na pierwszym planie', paragraphs: ['Wegańskie i wegetariańskie dania przestają być "alternatywą" — stają się główną atrakcją menu.'] },
      { heading: '5. Personalizacja menu', paragraphs: ['Goście mogą sami komponować posiłki z wybranych składników. Interaktywne menu buduje zaangażowanie i podnosi wrażenia.'] },
    ]),
  },
  {
    title: 'Organizacja eventu firmowego — o czym pamiętać',
    slug: 'organizacja-eventu-firmowego',
    excerpt: 'Checklist najważniejszych elementów udanego eventu korporacyjnego.',
    content: richTextWithHeadings([
      { heading: 'Określ cel wydarzenia', paragraphs: ['Integracja, konferencja, jubileusz firmy — cel determinuje formę cateringu, liczbę gości i budżet. Zacznij od briefu.'] },
      { heading: 'Catering dopasowany do agendy', paragraphs: ['Przerwa kawowa, lunch siadany czy bufet wieczorny — harmonogram dnia decyduje o formule gastronomicznej. Skonsultuj to z cateringiem.'] },
      { heading: 'Diety i alergeny', paragraphs: ['Zbierz informacje o alergiach i preferencjach dietetycznych uczestników z wyprzedzeniem. Profesjonalny caterer przygotuje warianty menu.'] },
    ]),
  },
  {
    title: 'Startujemy z blogiem Forest Catering',
    slug: 'startujemy-z-blogiem-forest-catering',
    excerpt: 'Poznaj kulisy naszej pracy i inspiracje kulinarne.',
    content: richTextWithHeadings([
      { heading: 'Dlaczego uruchomiliśmy blog?', paragraphs: ['Chcemy dzielić się wiedzą o organizacji eventów, podpowiadać sprawdzone rozwiązania i inspirować do tworzenia wyjątkowych wydarzeń.', 'Będziemy publikować praktyczne porady, kulisy naszych realizacji i sezonowe inspiracje menu.'] },
    ]),
  },
]

const EVENT_PACKAGES = [
  { name: 'Pakiet Basic', slug: 'pakiet-basic', tier: 'basic' as const, priceFrom: 8500, sortOrder: 0, features: ['Dostawa i rozstawienie bufetu', 'Menu do wyboru (2 dania główne)', 'Naczynia i sztućce jednorazowe premium', 'Serwetki i dekoracja stołu'] },
  { name: 'Pakiet Premium', slug: 'pakiet-premium', tier: 'premium' as const, priceFrom: 12000, sortOrder: 10, features: ['Serwis kelnerski (1 kelner / 20 os.)', 'Menu degustacyjne (5 dań)', 'Porcelana i szkło', 'Dekoracja kwiatowa stołów', 'Koordynator na miejscu'] },
  { name: 'Pakiet Catering + Bar', slug: 'pakiet-catering-plus-bar', tier: 'catering-plus-bar' as const, priceFrom: 16000, sortOrder: 20, features: ['Pełen serwis kelnerski', 'Menu premium (6 dań)', 'Mobilny bar z barmanem', '5 koktajli autorskich', 'Pokaz flair', 'Oświetlenie barowe LED'] },
]

/* ─── seed function ───────────────────────────────────────────── */

async function seed() {
  if (!process.env.DATABASE_URI || !process.env.PAYLOAD_SECRET) throw new Error('DATABASE_URI and PAYLOAD_SECRET are required')

  const forceSeed = isTruthy(process.env.SEED_FORCE)
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail) throw new Error('ADMIN_EMAIL is required for seeding admin user.')

  if (!adminPassword) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ADMIN_PASSWORD is required in production. Refusing to seed without secure credentials.')
    }
  }

  const safeAdminPassword = adminPassword || 'Admin123!'

  fs.mkdirSync(MEDIA_DIR, { recursive: true })
  const configPath = path.resolve(__dirname, '../../payload.config.ts')
  const payload = await getPayload({ config: (await import(configPath)).default })

  // ─── Admin ──────────────────────────────────────────────────
  const existingAdmin = await payload.find({ collection: 'users', where: { email: { equals: adminEmail } }, limit: 1 })
  if (!existingAdmin.docs[0]) {
    await payload.create({
      collection: 'users',
      data: {
        email: adminEmail,
        password: safeAdminPassword,
        name: 'Admin',
        role: 'admin',
      } as never,
    })
  }

  // ─── Navigation ─────────────────────────────────────────────
  await seedGlobalIfMissing({
    payload,
    slug: 'navigation',
    force: forceSeed,
    data: {
      headerItems: [
        { label: 'Oferta', url: '/oferta' },
        { label: 'Eventy', url: '/eventy' },
        { label: 'Galeria', url: '/galeria' },
        { label: 'Sklep', url: '/sklep' },
        { label: 'Blog', url: '/blog' },
        { label: 'Kontakt', url: '/kontakt' },
      ],
      footerColumns: [
        {
          title: 'Oferta',
          links: [
            { label: 'Catering dzienny', url: '/sklep?category=catering-dzienny' },
            { label: 'Catering eventowy', url: '/sklep?category=catering-eventowy' },
            { label: 'Bar mobilny', url: '/sklep?category=bar-mobilny' },
            { label: 'Wypożyczalnia', url: '/sklep?category=wypozyczalnia' },
            { label: 'Pakiety', url: '/oferta' },
          ],
        },
        {
          title: 'Firma',
          links: [
            { label: 'O nas', url: '/o-nas' },
            { label: 'Realizacje', url: '/realizacje' },
            { label: 'Blog', url: '/blog' },
            { label: 'FAQ', url: '/faq' },
          ],
        },
        {
          title: 'Informacje',
          links: [
            { label: 'Kontakt', url: '/kontakt' },
            { label: 'Regulamin', url: '/regulamin' },
            { label: 'Polityka prywatności', url: '/polityka-prywatnosci' },
          ],
        },
      ],
    },
  })

  // ─── Site Settings ──────────────────────────────────────────
  await seedGlobalIfMissing({
    payload,
    slug: 'site-settings',
    force: forceSeed,
    data: {
      companyName: 'Forest Catering',
      phone: '+48 91 433 56 78',
      email: 'kontakt@forestcatering.pl',
      address: {
        street: 'ul. Leśna 12',
        city: 'Szczecin',
        postalCode: '71-800',
      },
      socialLinks: {
        facebook: 'https://facebook.com/forestcatering',
        instagram: 'https://instagram.com/forestcatering',
      },
      businessHours: 'Pon–Pt: 8:00–18:00\nSob: 9:00–14:00\nNdz: nieczynne',
      minOrderAmount: 5000,
      deliveryFee: 1500,
      freeDeliveryThreshold: 15000,
      seoDefaults: {
        metaTitle: 'Forest Catering — Catering premium w Szczecinie',
        metaDescription: 'Profesjonalny catering eventowy, firmowy i weselny w Szczecinie. Świeże lokalne składniki, indywidualne menu, obsługa baru.',
      },
    },
  })

  // ─── Categories ─────────────────────────────────────────────
  const categoryMap: Record<string, number> = {}
  for (const category of CATEGORIES) {
    const existing = await payload.find({ collection: 'categories', where: { slug: { equals: category.slug } }, limit: 1 })
    const doc = existing.docs[0]
      ? await payload.update({ collection: 'categories', id: existing.docs[0].id, data: category })
      : await payload.create({ collection: 'categories', data: category })
    categoryMap[category.slug] = Number(doc.id)
  }

  // Set parent for rental subcategories
  const rentalParentId = categoryMap['wypozyczalnia']
  if (rentalParentId) {
    for (const subSlug of ['zastawa-porcelanowa', 'sztucce', 'kieliszki-i-szklanki']) {
      const subId = categoryMap[subSlug]
      if (subId) {
        await payload.update({
          collection: 'categories',
          id: subId,
          data: { parent: rentalParentId },
        })
      }
    }
  }

  // ─── Products ───────────────────────────────────────────────
  for (const [index, product] of PRODUCTS.entries()) {
    const imgBuffer = await generatePlaceholder(product.name, product.color)
    const filename = `${product.slug}.png`
    const filePath = path.join(MEDIA_DIR, filename)
    fs.writeFileSync(filePath, imgBuffer)

    const mediaExisting = await payload.find({ collection: 'media', where: { alt: { equals: product.name } }, limit: 1 })
    const media = mediaExisting.docs[0]
      ? mediaExisting.docs[0]
      : await payload.create({
          collection: 'media',
          data: {
            alt: product.name,
            imageSlug: slugifySafe(product.slug) || `image-${Date.now()}`,
          },
          draft: false,
          file: {
            data: imgBuffer,
            name: filename,
            mimetype: 'image/png',
            size: imgBuffer.length,
          },
        })

    const existing = await payload.find({ collection: 'products', where: { slug: { equals: product.slug } }, limit: 1 })
    const data = {
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      price: product.price,
      ...(product.compareAtPrice ? { compareAtPrice: product.compareAtPrice } : {}),
      category: categoryMap[product.category],
      images: [{ image: media.id }],
      imageUrl: product.imageUrl,
      productType: product.productType,
      isAvailable: true,
      isFeatured: product.isFeatured,
      sortOrder: index * 10,
      ...(product.allergens ? { allergens: product.allergens } : {}),
      ...(product.dietary ? { dietary: product.dietary } : {}),
      ...(product.weight ? { weight: product.weight } : {}),
      ...(product.servings ? { servings: product.servings } : {}),
      color: product.color,
    }

    if (existing.docs[0]) {
      await payload.update({ collection: 'products', id: existing.docs[0].id, data: data as never })
    } else {
      await payload.create({ collection: 'products', data: data as never })
    }
  }

  // ─── Event Packages ─────────────────────────────────────────
  for (const pkg of EVENT_PACKAGES) {
    const existing = await payload.find({ collection: 'event-packages', where: { slug: { equals: pkg.slug } }, limit: 1 })
    const data = {
      name: pkg.name,
      slug: pkg.slug,
      tier: pkg.tier,
      priceFrom: pkg.priceFrom,
      sortOrder: pkg.sortOrder,
      features: pkg.features.map((f) => ({ feature: f })),
    }
    if (existing.docs[0]) {
      await payload.update({ collection: 'event-packages', id: existing.docs[0].id, data })
    } else {
      await payload.create({ collection: 'event-packages', data })
    }
  }

  // ─── Blog Posts ─────────────────────────────────────────────
  for (const post of POSTS) {
    const existing = await payload.find({ collection: 'posts', where: { slug: { equals: post.slug } }, limit: 1 })
    const data = { title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, status: 'published' as const, publishedAt: new Date().toISOString() }
    if (existing.docs[0]) {
      await payload.update({ collection: 'posts', id: existing.docs[0].id, data: data as never })
    } else {
      await payload.create({ collection: 'posts', data: data as never })
    }
  }

  // ─── Pages ──────────────────────────────────────────────────
  const homeSlug = process.env.HOME_PAGE_SLUG || 'home'

  const pagesData = [
    {
      title: 'Forest Catering — Strona główna',
      slug: homeSlug,
      sortOrder: 0,
      _status: 'published' as const,
      seo: {
        metaTitle: 'Forest Catering — Catering premium w Szczecinie',
        metaDescription: 'Profesjonalny catering eventowy, firmowy i weselny w Szczecinie. Świeże lokalne składniki.',
      },
      sections: [
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
            { value: 12, suffix: '+', label: 'Lat doświadczenia' },
            { value: 50, suffix: '+', label: 'Pozycji w menu' },
            { value: 100, suffix: '%', label: 'Zadowolonych klientów' },
          ],
        },
        {
          blockType: 'services',
          heading: 'Czym się zajmujemy',
          items: [
            { emoji: '🍽️', title: 'Catering firmowy', description: 'Profesjonalna obsługa spotkań biznesowych, konferencji i codziennych dostaw lunchów do biura.', link: '/oferta' },
            { emoji: '🎉', title: 'Eventy prywatne', description: 'Kompleksowa obsługa imprez okolicznościowych — urodziny, jubileusze, przyjęcia plenerowe.', link: '/eventy' },
            { emoji: '💒', title: 'Wesela', description: 'Wyjątkowe menu weselne dopasowane do Waszego stylu — od rustykalnego po elegancki.', link: '/sklep?category=catering-weselny' },
            { emoji: '🍸', title: 'Bar mobilny', description: 'Profesjonalny barman, koktajle autorskie, pokazy flair i lemonade bar.', link: '/sklep?category=bar-mobilny' },
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
          heading: 'Gotujemy z pasją od ponad 12 lat',
          content: richText([
            'Forest Catering to zespół doświadczonych kucharzy i pasjonatów dobrego jedzenia ze Szczecina. Specjalizujemy się w cateringu eventowym, firmowym i weselnym, zawsze stawiając na najwyższą jakość składników i indywidualne podejście do każdego klienta.',
            'Współpracujemy z lokalnymi dostawcami, korzystamy z sezonowych składników i przygotowujemy wszystko ręcznie — od pieczywa po desery. Każde zamówienie traktujemy jak wyzwanie, któremu chcemy sprostać na najwyższym poziomie.',
          ]),
          highlights: [
            { text: 'Świeże lokalne składniki' },
            { text: 'Ręczne przygotowanie' },
            { text: 'Indywidualne menu' },
            { text: 'Doświadczony zespół' },
          ],
          ctaText: 'Poznaj nas bliżej',
          ctaLink: '/o-nas',
        },
        {
          blockType: 'testimonials',
          heading: 'Co mówią nasi klienci',
          items: [
            { quote: 'Forest Catering zapewnił niesamowite jedzenie na nasze wesele. Goście do dziś wspominają te dania!', author: 'Anna i Marcin', event: 'Wesele', rating: 5 },
            { quote: 'Profesjonalne podejście, elastyczność i pyszne jedzenie. Stały partner naszej firmy.', author: 'Tomasz K.', event: 'Catering firmowy', rating: 5 },
            { quote: 'Obsługa baru na naszym evencie firmowym była na najwyższym poziomie! Koktajle fenomenalne.', author: 'Marta W.', event: 'Event firmowy', rating: 5 },
            { quote: 'Zamawiam boxy lunchowe do biura 3x w tygodniu. Świeże, smaczne, zawsze punktualnie.', author: 'Karol D.', event: 'Catering dzienny', rating: 5 },
          ],
        },
        {
          blockType: 'steps',
          heading: 'Jak współpracujemy',
          steps: [
            { emoji: '📞', title: 'Kontakt', description: 'Opowiedz nam o wydarzeniu, preferencjach i budżecie — telefonicznie, mailowo lub przez formularz.' },
            { emoji: '📋', title: 'Oferta i degustacja', description: 'Przygotowujemy dopasowane menu i zapraszamy na bezpłatną degustację wybranych dań.' },
            { emoji: '🎉', title: 'Realizacja', description: 'Dostarczamy catering, obsługujemy event na miejscu i dbamy o każdy detal.' },
          ],
        },
        {
          blockType: 'cta',
          heading: 'Gotowy na niezapomniane wydarzenie?',
          text: 'Odpowiadamy w ciągu 24h. Bezpłatna wycena i degustacja.',
          buttonText: 'Napisz do nas',
          buttonLink: '/kontakt',
          variant: 'primary',
          secondaryButtonText: 'Zadzwoń',
          secondaryButtonLink: 'tel:+48914335678',
        },
      ],
    },
    // ── Oferta ──
    {
      title: 'Oferta',
      slug: 'oferta',
      sortOrder: 10,
      _status: 'published' as const,
      seo: {
        metaTitle: 'Oferta cateringowa — Forest Catering Szczecin',
        metaDescription: 'Pakiety cateringowe na eventy, wesela i spotkania firmowe. Sprawdź cennik i zamów wycenę.',
      },
      sections: [
        {
          blockType: 'hero',
          heading: 'Nasza oferta',
          subheading: 'Dopasujemy catering do Twoich potrzeb — od kameralnych spotkań po wielkie gale',
          badge: '📋 Pakiety i wycena',
          ctaText: 'Zapytaj o wycenę',
          ctaLink: '/kontakt',
        },
        {
          blockType: 'offerCards',
          heading: 'Wybierz zakres obsługi',
          cards: [
            {
              title: 'Catering dzienny',
              priceFrom: 'od 33 zł/os.',
              features: [{ text: 'Zestawy lunchowe i boxy' }, { text: 'Opcje wege, vegan, fit' }, { text: 'Dostawa do biura' }, { text: 'Zamówienia od 5 osób' }],
              ctaText: 'Zobacz menu',
              ctaLink: '/sklep?category=catering-dzienny',
            },
            {
              title: 'Catering eventowy',
              priceFrom: 'od 85 zł/os.',
              featured: true,
              badge: 'Najpopularniejszy',
              features: [{ text: 'Bufet lub serwis kelnerski' }, { text: 'Finger food i stacje kulinarne' }, { text: 'Dekoracja stołów' }, { text: 'Obsługa od 20 osób' }],
              ctaText: 'Zapytaj o wycenę',
              ctaLink: '/kontakt?event=event',
            },
            {
              title: 'Catering weselny',
              priceFrom: 'od 145 zł/os.',
              features: [{ text: 'Menu 5-daniowe' }, { text: 'Tort i candy bar' }, { text: 'Serwis premium' }, { text: 'Koordynator weselny' }],
              ctaText: 'Zapytaj o wycenę',
              ctaLink: '/kontakt?event=wesele',
            },
            {
              title: 'Bar mobilny',
              priceFrom: 'od 45 zł/os.',
              features: [{ text: 'Koktajle autorskie' }, { text: 'Pokaz barmański flair' }, { text: 'Lemonade bar' }, { text: 'Barówka z oświetleniem LED' }],
              ctaText: 'Zapytaj o wycenę',
              ctaLink: '/kontakt?event=bar',
            },
          ],
        },
        {
          blockType: 'pricing',
          heading: 'Pakiety eventowe',
          subheading: 'Gotowe warianty, które możesz dostosować do swojego wydarzenia.',
          packages: [
            { name: 'Basic', price: 'od 85 zł/os.', ctaText: 'Zapytaj o wycenę', ctaLink: '/kontakt?pakiet=basic', features: [{ text: 'Dostawa i rozstawienie bufetu' }, { text: '2 dania główne do wyboru' }, { text: 'Naczynia jednorazowe premium' }, { text: 'Serwetki i dekoracja' }] },
            { name: 'Premium', price: 'od 120 zł/os.', featured: true, ctaText: 'Zapytaj o wycenę', ctaLink: '/kontakt?pakiet=premium', features: [{ text: 'Serwis kelnerski' }, { text: 'Menu degustacyjne 5 dań' }, { text: 'Porcelana i szkło' }, { text: 'Dekoracja kwiatowa' }, { text: 'Koordynator na miejscu' }] },
            { name: 'Catering + Bar', price: 'od 160 zł/os.', ctaText: 'Zapytaj o wycenę', ctaLink: '/kontakt?pakiet=bar', features: [{ text: 'Pełen serwis premium' }, { text: 'Menu 6 dań' }, { text: 'Mobilny bar z barmanem' }, { text: '5 koktajli autorskich' }, { text: 'Pokaz flair' }] },
          ],
        },
        {
          blockType: 'cta',
          heading: 'Potrzebujesz indywidualnej wyceny?',
          text: 'Każde wydarzenie jest inne. Napisz do nas, a przygotujemy ofertę szytą na miarę.',
          buttonText: 'Skontaktuj się',
          buttonLink: '/kontakt',
        },
      ],
    },
    // ── Eventy ──
    {
      title: 'Eventy',
      slug: 'eventy',
      sortOrder: 20,
      _status: 'published' as const,
      seo: {
        metaTitle: 'Obsługa eventów — Forest Catering Szczecin',
        metaDescription: 'Kompleksowa obsługa cateringowa eventów firmowych, wesel i imprez prywatnych w Szczecinie.',
      },
      sections: [
        {
          blockType: 'hero',
          heading: 'Obsługa eventów',
          subheading: 'Kompleksowa organizacja kulinarna wydarzeń prywatnych i firmowych',
          badge: '🎉 Eventy i wesela',
          ctaText: 'Umów konsultację',
          ctaLink: '/kontakt?event=event-prywatny',
        },
        {
          blockType: 'services',
          heading: 'Rodzaje eventów',
          items: [
            { emoji: '🏢', title: 'Konferencje i szkolenia', description: 'Przerwy kawowe, lunch bufetowy, catering konferencyjny na 50–500 osób.' },
            { emoji: '🎂', title: 'Urodziny i jubileusze', description: 'Kameralne przyjęcia z serwisem kelnerskim i spersonalizowanym menu.' },
            { emoji: '💒', title: 'Wesela', description: 'Od degustacji po candy bar — pełna obsługa weselna z koordynatorem.' },
            { emoji: '🏖️', title: 'Eventy plenerowe', description: 'Food trucki, stacje grillowe, pikniki firmowe pod gołym niebem.' },
          ],
        },
        {
          blockType: 'pricing',
          heading: 'Pakiety eventowe',
          packages: [
            { name: 'BASIC', price: 'od 85 zł/os.', ctaText: 'Wybieram Basic', ctaLink: '/kontakt?pakiet=basic', features: [{ text: 'Dostawa i serwis' }, { text: '2 dania główne' }, { text: 'Naczynia premium' }] },
            { name: 'PREMIUM', price: 'od 120 zł/os.', featured: true, ctaText: 'Wybieram Premium', ctaLink: '/kontakt?pakiet=premium', features: [{ text: 'Menu degustacyjne 5 dań' }, { text: 'Serwis kelnerski' }, { text: 'Porcelana i szkło' }, { text: 'Koordynator' }] },
            { name: 'CATERING + BAR', price: 'od 160 zł/os.', ctaText: 'Wybieram Bar', ctaLink: '/kontakt?pakiet=bar', features: [{ text: 'Pełen serwis premium' }, { text: 'Mobilny bar' }, { text: 'Koktajle autorskie' }, { text: 'Pokaz flair' }] },
          ],
        },
        {
          blockType: 'steps',
          heading: 'Jak to działa?',
          steps: [
            { emoji: '1️⃣', title: 'Kontakt i potrzeby', description: 'Opowiedz nam o wydarzeniu, liczbie gości i budżecie.' },
            { emoji: '2️⃣', title: 'Oferta i degustacja', description: 'Przygotowujemy propozycję menu. Zapraszamy na bezpłatną degustację.' },
            { emoji: '3️⃣', title: 'Realizacja', description: 'Dostarczamy catering i obsługujemy event na miejscu od A do Z.' },
          ],
        },
        {
          blockType: 'testimonials',
          heading: 'Opinie o naszych eventach',
          items: [
            { quote: 'Perfekcyjna organizacja eventu firmowego na 200 osób. Jedzenie i serwis na najwyższym poziomie.', author: 'Piotr M.', event: 'Gala firmowa', rating: 5 },
            { quote: 'Goście na jubileuszu byli zachwyceni. Koordynator zadbał o każdy detal.', author: 'Ewa S.', event: 'Jubileusz 50-lecia', rating: 5 },
          ],
        },
        {
          blockType: 'cta',
          heading: 'Planujesz wydarzenie?',
          text: 'Napisz do nas, a przygotujemy ofertę dopasowaną do Twojego eventu.',
          buttonText: 'Umów konsultację',
          buttonLink: '/kontakt',
        },
      ],
    },
    // ── Galeria ──
    {
      title: 'Galeria',
      slug: 'galeria',
      sortOrder: 30,
      _status: 'published' as const,
      seo: {
        metaTitle: 'Galeria realizacji — Forest Catering',
        metaDescription: 'Zobacz nasze realizacje cateringowe i eventowe. Zdjęcia z wesel, eventów firmowych i imprez prywatnych.',
      },
      sections: [
        { blockType: 'hero', heading: 'Galeria realizacji', subheading: 'Zobacz nasze ostatnie realizacje eventowe i cateringowe' },
        {
          blockType: 'cta',
          heading: 'Chcesz podobną realizację?',
          text: 'Skontaktuj się z nami i opowiedz o swoim wydarzeniu.',
          buttonText: 'Napisz do nas',
          buttonLink: '/kontakt',
        },
      ],
    },
    // ── Kontakt ──
    {
      title: 'Kontakt',
      slug: 'kontakt',
      sortOrder: 40,
      _status: 'published' as const,
      seo: {
        metaTitle: 'Kontakt — Forest Catering Szczecin',
        metaDescription: 'Skontaktuj się z Forest Catering. Bezpłatna wycena cateringu w Szczecinie i okolicach.',
      },
      sections: [
        {
          blockType: 'contactForm',
          heading: 'Kontakt',
          subheading: 'Napisz do nas — odpowiadamy w ciągu 24h. Bezpłatna wycena.',
        },
        {
          blockType: 'mapArea',
          heading: 'Obszar działania',
          description: 'Działamy głównie w województwie zachodniopomorskim. Realizujemy też zlecenia w całej Polsce.',
          embedUrl: 'https://maps.google.com/maps?q=Szczecin&z=11&output=embed',
          cities: [{ name: 'Szczecin' }, { name: 'Police' }, { name: 'Stargard' }, { name: 'Goleniów' }, { name: 'Świnoujście' }, { name: 'Koszalin' }],
        },
        {
          blockType: 'faq',
          items: [
            { question: 'Jak szybko odpowiadacie na zapytania?', answer: 'Zwykle wracamy z odpowiedzią w ciągu 24 godzin roboczych. W pilnych sprawach zadzwoń pod nasz numer.' },
            { question: 'Czy mogę zamówić degustację?', answer: 'Tak! Dla eventów powyżej 50 osób oferujemy bezpłatną degustację wybranych dań z menu.' },
            { question: 'Jaki jest minimalny czas realizacji?', answer: 'Standardowo potrzebujemy 3–5 dni roboczych. W wyjątkowych sytuacjach realizujemy też zlecenia ekspresowe.' },
          ],
        },
      ],
    },
    // ── O nas ──
    {
      title: 'O nas',
      slug: 'o-nas',
      sortOrder: 50,
      _status: 'published' as const,
      seo: {
        metaTitle: 'O nas — Forest Catering Szczecin',
        metaDescription: 'Poznaj zespół Forest Catering. 12 lat doświadczenia w cateringu eventowym, firmowym i weselnym.',
      },
      sections: [
        {
          blockType: 'hero',
          heading: 'Poznaj Forest Catering',
          subheading: 'Zespół pasjonatów gastronomii z ponad 12-letnim doświadczeniem',
          badge: '🌲 O nas',
        },
        {
          blockType: 'about',
          heading: 'Nasza historia',
          content: richText([
            'Forest Catering powstał w 2014 roku jako mały rodzinny biznes cateringowy w Szczecinie. Od początku stawialiśmy na jakość — świeże, lokalne składniki i ręczne przygotowanie każdego dania.',
            'Dziś obsługujemy ponad 50 wydarzeń rocznie — od kameralnych spotkań po wielkie gale na 500 osób. Nasz zespół to 15 doświadczonych kucharzy, kelnerów i barmanów, którzy kochają to, co robią.',
            'Nazwa „Forest" nie jest przypadkowa — inspirujemy się naturalnością, sezonowością i lokalnym terroir. Współpracujemy z farmami z okolic Szczecina, pieczemy własne pieczywo i przygotowujemy desery od zera.',
          ]),
          highlights: [
            { text: '500+ zrealizowanych eventów' },
            { text: '12 lat doświadczenia' },
            { text: '15 osób w zespole' },
            { text: '100% składników z Polski' },
          ],
          ctaText: 'Napisz do nas',
          ctaLink: '/kontakt',
        },
        {
          blockType: 'stats',
          items: [
            { value: 500, suffix: '+', label: 'Zrealizowanych eventów' },
            { value: 12, suffix: '+', label: 'Lat doświadczenia' },
            { value: 15, suffix: '', label: 'Osób w zespole' },
            { value: 50000, suffix: '+', label: 'Wydanych porcji' },
          ],
        },
        {
          blockType: 'testimonials',
          heading: 'Zaufali nam',
          items: [
            { quote: 'Forest Catering to profesjonalizm w każdym calu. Od lat zamawiamy u nich catering na nasze eventy firmowe.', author: 'Jan Kowalski', event: 'Dyrektor HR, TechCorp', rating: 5 },
            { quote: 'Obsługa naszego wesela była perfekcyjna. 150 gości, 6 dań, ciepły serwis — bez najmniejszego potknięcia.', author: 'Kasia i Tomek', event: 'Wesele', rating: 5 },
          ],
        },
        {
          blockType: 'cta',
          heading: 'Porozmawiajmy o Twoim wydarzeniu',
          text: 'Chcesz wiedzieć więcej? Umów się na spotkanie lub degustację.',
          buttonText: 'Kontakt',
          buttonLink: '/kontakt',
        },
      ],
    },
    // ── Realizacje ──
    {
      title: 'Realizacje',
      slug: 'realizacje',
      sortOrder: 55,
      _status: 'published' as const,
      seo: {
        metaTitle: 'Realizacje — Forest Catering',
        metaDescription: 'Przegląd naszych realizacji cateringowych — eventy firmowe, wesela, imprezy prywatne.',
      },
      sections: [
        {
          blockType: 'hero',
          heading: 'Nasze realizacje',
          subheading: 'Każde wydarzenie to dla nas unikalne wyzwanie. Zobacz jak je realizujemy.',
        },
        {
          blockType: 'testimonials',
          heading: 'Opinie klientów',
          items: [
            { quote: 'Goście byli zachwyceni jakością dań i serwisu. Polecam z czystym sumieniem!', author: 'Karolina S.', event: 'Jubileusz 25-lecia firmy', rating: 5 },
            { quote: 'Piknik firmowy na 300 osób — organizacja bez zarzutu, jedzenie fantastyczne.', author: 'Robert P.', event: 'Piknik integracyjny', rating: 5 },
          ],
        },
        {
          blockType: 'cta',
          heading: 'Chcesz podobną realizację?',
          text: 'Opowiedz nam o swoim wydarzeniu, a przygotujemy indywidualną propozycję.',
          buttonText: 'Skontaktuj się',
          buttonLink: '/kontakt',
        },
      ],
    },
    // ── Regulamin ──
    {
      title: 'Regulamin',
      slug: 'regulamin',
      sortOrder: 60,
      _status: 'published' as const,
      seo: {
        metaTitle: 'Regulamin — Forest Catering',
        metaDescription: 'Regulamin świadczenia usług Forest Catering.',
      },
      sections: [
        {
          blockType: 'legalText',
          heading: 'Regulamin',
          effectiveDate: '2026-01-01',
          content: richTextWithHeadings([
            { heading: '§1 Postanowienia ogólne', paragraphs: [
              'Niniejszy regulamin określa zasady korzystania z usług cateringowych świadczonych przez Forest Catering z siedzibą w Szczecinie, ul. Leśna 12, 71-800 Szczecin.',
              'Usługodawca świadczy usługi cateringowe na terenie województwa zachodniopomorskiego oraz na terenie całego kraju po indywidualnym uzgodnieniu.',
            ] },
            { heading: '§2 Składanie zamówień', paragraphs: [
              'Zamówienia można składać telefonicznie, mailowo lub za pośrednictwem formularza kontaktowego na stronie internetowej.',
              'Zamówienie uważa się za przyjęte po pisemnym potwierdzeniu przez Forest Catering i wpłaceniu zadatku w wysokości 30% wartości zamówienia.',
            ] },
            { heading: '§3 Realizacja usług', paragraphs: [
              'Forest Catering zobowiązuje się do realizacji usługi zgodnie z ustalonym menu i harmonogramem.',
              'W przypadku konieczności zmiany składników z przyczyn niezależnych od usługodawcy, zostaną zaproponowane zamienniki o równoważnej jakości.',
            ] },
            { heading: '§4 Płatności', paragraphs: [
              'Płatność za usługi następuje przelewem bankowym lub gotówką. Zadatek (30%) jest wymagany przy potwierdzeniu zamówienia, a pozostała kwota — najpóźniej 3 dni przed realizacją.',
            ] },
            { heading: '§5 Reklamacje', paragraphs: [
              'Klient ma prawo złożyć reklamację drogą mailową na adres kontakt@forestcatering.pl lub telefonicznie w terminie 7 dni od realizacji usługi.',
              'Reklamacje są rozpatrywane w terminie 14 dni roboczych od daty zgłoszenia.',
            ] },
            { heading: '§6 Postanowienia końcowe', paragraphs: [
              'Regulamin wchodzi w życie z dniem 1 stycznia 2026 roku.',
              'W sprawach nieuregulowanych niniejszym regulaminem zastosowanie mają przepisy Kodeksu Cywilnego.',
            ] },
          ]),
        },
      ],
    },
    // ── Polityka prywatności ──
    {
      title: 'Polityka prywatności',
      slug: 'polityka-prywatnosci',
      sortOrder: 70,
      _status: 'published' as const,
      seo: {
        metaTitle: 'Polityka prywatności — Forest Catering',
        metaDescription: 'Polityka prywatności i ochrona danych osobowych Forest Catering.',
      },
      sections: [
        {
          blockType: 'legalText',
          heading: 'Polityka prywatności',
          effectiveDate: '2026-01-01',
          content: richTextWithHeadings([
            { heading: '1. Administrator danych', paragraphs: [
              'Administratorem danych osobowych jest Forest Catering, ul. Leśna 12, 71-800 Szczecin. Kontakt: kontakt@forestcatering.pl, tel. +48 91 433 56 78.',
            ] },
            { heading: '2. Zakres przetwarzania', paragraphs: [
              'Przetwarzamy dane osobowe wyłącznie w zakresie niezbędnym do realizacji usług cateringowych, obsługi zamówień, wystawiania faktur oraz komunikacji z klientami.',
              'Dane zbierane przez formularz kontaktowy: imię, nazwisko, adres e-mail, numer telefonu, treść wiadomości.',
            ] },
            { heading: '3. Podstawa prawna', paragraphs: [
              'Dane przetwarzamy na podstawie: zgody (art. 6 ust. 1 lit. a RODO), realizacji umowy (art. 6 ust. 1 lit. b RODO) oraz prawnie uzasadnionego interesu administratora (art. 6 ust. 1 lit. f RODO).',
            ] },
            { heading: '4. Prawa użytkowników', paragraphs: [
              'Masz prawo do: dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia oraz wniesienia sprzeciwu. Przysługuje Ci także prawo złożenia skargi do Prezesa UODO.',
            ] },
            { heading: '5. Pliki cookies', paragraphs: [
              'Strona korzysta z plików cookies w celu zapewnienia prawidłowego działania, analizy ruchu i personalizacji treści. Możesz zarządzać cookies w ustawieniach przeglądarki.',
            ] },
          ]),
        },
      ],
    },
    // ── FAQ ──
    {
      title: 'FAQ — Najczęściej zadawane pytania',
      slug: 'faq',
      sortOrder: 80,
      _status: 'published' as const,
      seo: {
        metaTitle: 'FAQ — Forest Catering',
        metaDescription: 'Odpowiedzi na najczęściej zadawane pytania o catering eventowy, firmowy i weselny.',
      },
      sections: [
        {
          blockType: 'hero',
          heading: 'Najczęściej zadawane pytania',
          subheading: 'Odpowiedzi na pytania, które słyszymy najczęściej',
        },
        {
          blockType: 'faq',
          items: [
            { question: 'Jaki jest minimalny rozmiar zamówienia?', answer: 'Catering dzienny realizujemy od 5 osób. Catering eventowy — od 20 osób. Dla mniejszych grup przygotowujemy indywidualną ofertę.' },
            { question: 'Czy przygotowujecie menu wegetariańskie i wegańskie?', answer: 'Tak! Oferujemy pełne warianty wegetariańskie, wegańskie, bezglutenowe i low-carb. Każde menu może być dostosowane do diet specjalnych.' },
            { question: 'Ile wcześniej trzeba złożyć zamówienie?', answer: 'Catering dzienny — 2 dni robocze. Catering eventowy — minimum 2 tygodnie, optymalnie 1–2 miesiące. Wesela — 3–6 miesięcy.' },
            { question: 'Czy oferujecie degustację?', answer: 'Tak! Dla eventów powyżej 50 osób oferujemy bezpłatną degustację 3–5 dań z proponowanego menu.' },
            { question: 'Jaki jest obszar dostawy?', answer: 'Głównie województwo zachodniopomorskie (Szczecin, Police, Stargard, Goleniów, Świnoujście). Realizujemy też zlecenia w całej Polsce po indywidualnym uzgodnieniu.' },
            { question: 'Czy zapewniacie naczynia i sztućce?', answer: 'Tak! W pakiecie Basic dostarczamy naczynia jednorazowe premium. W pakietach Premium i Catering+Bar — porcelanę i szkło.' },
            { question: 'Jak wygląda proces zamówienia?', answer: 'Kontakt → konsultacja i ustalenie menu → degustacja (opcjonalnie) → wpłata zadatku 30% → realizacja. Resztę płatności wpłacasz 3 dni przed eventem.' },
            { question: 'Czy obsługujecie eventy poza Szczecinem?', answer: 'Tak! Realizujemy zlecenia na terenie całej Polski. Koszty transportu ustalamy indywidualnie w zależności od lokalizacji.' },
          ],
        },
        {
          blockType: 'contactForm',
          heading: 'Nie znalazłeś odpowiedzi?',
          subheading: 'Wyślij nam pytanie — odpowiemy w ciągu 24h.',
        },
      ],
    },
    // ── Cennik ──
    {
      title: 'Cennik',
      slug: 'cennik',
      sortOrder: 85,
      _status: 'published' as const,
      seo: {
        metaTitle: 'Cennik — Forest Catering Szczecin',
        metaDescription: 'Sprawdź orientacyjne ceny usług cateringowych Forest Catering. Pakiety, bufety, bar mobilny.',
      },
      sections: [
        {
          blockType: 'hero',
          heading: 'Cennik usług',
          subheading: 'Orientacyjne ceny naszych usług. Ostateczna wycena zawsze jest indywidualna.',
        },
        {
          blockType: 'pricing',
          heading: 'Catering',
          packages: [
            { name: 'Lunch box', price: '33–55 zł/os.', features: [{ text: 'Zestaw lunchowy' }, { text: 'Dostawa do biura' }, { text: 'Od 5 osób' }], ctaText: 'Zamów', ctaLink: '/sklep?category=catering-dzienny' },
            { name: 'Bufet Standard', price: '85–110 zł/os.', features: [{ text: '2 dania główne' }, { text: 'Przystawki' }, { text: 'Od 20 osób' }], ctaText: 'Zapytaj', ctaLink: '/kontakt' },
            { name: 'Bufet Premium', price: '120–160 zł/os.', featured: true, features: [{ text: '5 dań + deser' }, { text: 'Serwis kelnerski' }, { text: 'Porcelana i szkło' }], ctaText: 'Zapytaj', ctaLink: '/kontakt' },
            { name: 'Wesele', price: '145–250 zł/os.', features: [{ text: 'Menu 5-6 dań' }, { text: 'Tort + candy bar' }, { text: 'Serwis premium' }], ctaText: 'Zapytaj', ctaLink: '/kontakt?event=wesele' },
          ],
        },
        {
          blockType: 'pricing',
          heading: 'Bar mobilny',
          packages: [
            { name: 'Bar Classic', price: '45 zł/os.', features: [{ text: '5 koktajli' }, { text: '1 barman' }, { text: 'Barówka mobilna' }], ctaText: 'Zapytaj', ctaLink: '/kontakt?event=bar' },
            { name: 'Bar Premium', price: '85 zł/os.', featured: true, features: [{ text: '10 koktajli' }, { text: '2 barmanów' }, { text: 'Pokaz flair + LED' }], ctaText: 'Zapytaj', ctaLink: '/kontakt?event=bar' },
            { name: 'Lemonade bar', price: '25 zł/os.', features: [{ text: '4 smaki' }, { text: 'Świeże owoce' }, { text: 'Dystrybutor z lodem' }], ctaText: 'Zapytaj', ctaLink: '/kontakt?event=bar' },
          ],
        },
        {
          blockType: 'pricing',
          heading: 'Wypożyczalnia',
          subheading: 'Zastawa, sztućce i szkło do wypożyczenia na Twoje wydarzenie.',
          packages: [
            {
              name: 'Zastawa porcelanowa',
              price: 'od 0,80 zł/szt.',
              features: [
                { text: 'Bulionówka — 1,00 zł' },
                { text: 'Spodek pod filiżankę — 0,90 zł' },
                { text: 'Filiżanka — 1,00 zł' },
                { text: 'Talerz deserowy — 0,80 zł' },
              ],
              ctaText: 'Zobacz w sklepie',
              ctaLink: '/sklep?category=zastawa-porcelanowa',
            },
            {
              name: 'Sztućce',
              price: 'od 0,39 zł/szt.',
              featured: true,
              features: [
                { text: 'Łyżeczka — 0,49 zł' },
                { text: 'Łyżka — 0,59 zł' },
                { text: 'Nóż — 0,59 zł' },
                { text: 'Widelec — 0,59 zł' },
                { text: 'Widelec przystawkowy — 0,49 zł' },
                { text: 'Widelec deserowy — 0,39 zł' },
              ],
              ctaText: 'Zobacz w sklepie',
              ctaLink: '/sklep?category=sztucce',
            },
            {
              name: 'Kieliszki i szklanki',
              price: 'od 0,75 zł/szt.',
              features: [
                { text: 'Szklanka — 0,75 zł' },
                { text: 'Kieliszek do wódki — 0,75 zł' },
                { text: 'Kieliszek do szampana — 1,20 zł' },
                { text: 'Kieliszek do wina — 1,20 zł' },
              ],
              ctaText: 'Zobacz w sklepie',
              ctaLink: '/sklep?category=kieliszki-i-szklanki',
            },
          ],
        },
        {
          blockType: 'faq',
          items: [
            { question: 'Czy cena obejmuje obsługę kelnerską?', answer: 'Serwis kelnerski jest wliczony w pakiety Premium i Catering+Bar. W pakiecie Basic dostępny za dopłatą.' },
            { question: 'Czy jest opłata za transport?', answer: 'Transport w obrębie Szczecina jest bezpłatny. Poza miastem doliczamy opłatę transportową, którą wyliczamy indywidualnie.' },
          ],
        },
        {
          blockType: 'cta',
          heading: 'Chcesz szczegółową kalkulację?',
          text: 'Opisz nam swoje wydarzenie, a przygotujemy ofertę z dokładną wyceną.',
          buttonText: 'Napisz do nas',
          buttonLink: '/kontakt',
        },
      ],
    },
  ]

  for (const pageData of pagesData) {
    const existingPage = await payload.find({ collection: 'pages', where: { slug: { equals: pageData.slug } }, limit: 1 })

    if (existingPage.docs[0]) {
      if (forceSeed) {
        await payload.update({ collection: 'pages', id: existingPage.docs[0].id, data: pageData as never })
      }
    } else {
      await payload.create({ collection: 'pages', data: pageData as never })
    }
  }

  // ─── Gallery pages: fill with product images ─────────────────
  const galleryMedia = await payload.find({ collection: 'media', limit: 12, sort: '-createdAt' })
  if (galleryMedia.docs.length && forceSeed) {
    const cats = ['eventy-firmowe', 'catering-prywatny', 'wesela', 'bar-mobilny']
    const catLabels = ['Eventy firmowe', 'Catering prywatny', 'Wesela', 'Bar mobilny']
    const galleryItems = galleryMedia.docs.map((media, index) => ({
      image: media.id,
      alt: media.alt || `Realizacja ${index + 1}`,
      category: cats[index % cats.length],
      categoryLabel: catLabels[index % catLabels.length],
    }))

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
              items: galleryItems,
            },
            {
              blockType: 'cta',
              heading: 'Chcesz podobną realizację?',
              text: 'Skontaktuj się z nami i opowiedz o swoim wydarzeniu.',
              buttonText: 'Napisz do nas',
              buttonLink: '/kontakt',
            },
          ],
        } as never,
      })
    }

    const realizacjePage = await payload.find({ collection: 'pages', where: { slug: { equals: 'realizacje' } }, limit: 1, depth: 0 })
    if (realizacjePage.docs[0]) {
      await payload.update({
        collection: 'pages',
        id: realizacjePage.docs[0].id,
        data: {
          sections: [
            {
              blockType: 'hero',
              heading: 'Nasze realizacje',
              subheading: 'Każde wydarzenie to dla nas unikalne wyzwanie. Zobacz jak je realizujemy.',
            },
            {
              blockType: 'galleryFull',
              heading: 'Realizacje',
              items: galleryItems,
            },
            {
              blockType: 'testimonials',
              heading: 'Opinie klientów',
              items: [
                { quote: 'Goście byli zachwyceni jakością dań i serwisu. Polecam z czystym sumieniem!', author: 'Karolina S.', event: 'Jubileusz 25-lecia firmy', rating: 5 },
                { quote: 'Piknik firmowy na 300 osób — organizacja bez zarzutu, jedzenie fantastyczne.', author: 'Robert P.', event: 'Piknik integracyjny', rating: 5 },
              ],
            },
            {
              blockType: 'cta',
              heading: 'Chcesz podobną realizację?',
              text: 'Opowiedz nam o swoim wydarzeniu, a przygotujemy indywidualną propozycję.',
              buttonText: 'Skontaktuj się',
              buttonLink: '/kontakt',
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
