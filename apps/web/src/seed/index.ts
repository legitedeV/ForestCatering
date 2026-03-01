import path from 'path'
import fs from 'fs'
import { getPayload } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { slugifySafe } from '../payload/lib/slug'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const MEDIA_DIR = path.resolve(__dirname, '../../public/media')

const CATEGORIES = [
  { name: 'Catering', slug: 'catering', description: 'Usługi cateringowe na każdą okazję' },
  { name: 'Eventy', slug: 'eventy', description: 'Pakiety eventowe i okolicznościowe' },
  { name: 'Bar', slug: 'bar', description: 'Napoje i przekąski barowe' },
  { name: 'Desery', slug: 'desery', description: 'Torty, ciasta i słodkości na każdą okazję' },
  { name: 'Weselne', slug: 'weselne', description: 'Menu weselne i obsługa uroczystości' },
] as const

const PRODUCTS: Array<{
  name: string
  slug: string
  shortDescription: string
  price: number
  compareAtPrice?: number
  productType: 'catering' | 'event' | 'bar'
  category: string
  color: string
  isFeatured: boolean
  imageUrl?: string
  allergens?: string[]
  dietary?: string[]
  weight?: string
  servings?: number
}> = [
  { name: 'Zestaw lunchowy Classic', slug: 'zestaw-lunchowy-classic', shortDescription: 'Klasyczny zestaw lunchowy z zupą dnia i daniem głównym. Świeże składniki, pełnowartościowy posiłek na każdy dzień.', price: 3599, productType: 'catering', category: 'catering', color: '#4a7c59', isFeatured: true, imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', allergens: ['gluten', 'dairy'], servings: 1 },
  { name: 'Zestaw lunchowy Premium', slug: 'zestaw-lunchowy-premium', shortDescription: 'Premium zestaw lunchowy z przystawką, zupą i deserem. Wyjątkowe doznania smakowe w przystępnej cenie.', price: 5499, compareAtPrice: 6299, productType: 'catering', category: 'catering', color: '#2d5a3d', isFeatured: true, imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80', allergens: ['gluten', 'dairy', 'eggs'], servings: 1 },
  { name: 'Bufet zimny "Leśna Polana"', slug: 'bufet-zimny-lesna-polana', shortDescription: 'Elegancki bufet zimny na 10-50 osób. Wędliny, sery, sałatki, pieczywo i wykwintne przystawki z lokalnych składników.', price: 7900, productType: 'catering', category: 'catering', color: '#3d6b4f', isFeatured: true, imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', allergens: ['gluten', 'dairy', 'eggs', 'mustard'], servings: 10 },
  { name: 'Menu bankietowe "Złota Jesień"', slug: 'menu-bankietowe-zlota-jesien', shortDescription: 'Kompletne menu bankietowe na 20-200 osób. 3 dania, serwis kelnerski i dekoracja stołów wliczone w cenę.', price: 12900, productType: 'catering', category: 'catering', color: '#7c6a2d', isFeatured: true, imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', allergens: ['gluten', 'dairy', 'eggs'], servings: 1 },
  { name: 'Przekąski finger food (30 szt.)', slug: 'przekaski-finger-food-30', shortDescription: 'Zestaw 30 wykwintnych przekąsek finger food. Idealne na cocktail party, wesele lub event firmowy.', price: 18900, productType: 'catering', category: 'catering', color: '#5a4a2d', isFeatured: false, imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', allergens: ['gluten', 'dairy', 'eggs', 'fish'], weight: '1.2 kg', servings: 10 },
  { name: 'Tatar z łososia na grzankach', slug: 'tatar-z-lososia-na-grzankach', shortDescription: 'Delikatny tatar z świeżego łososia podany na chrupiących grzankach z masłem ziołowym. Zestaw 12 szt.', price: 4500, productType: 'catering', category: 'catering', color: '#c45c3a', isFeatured: false, imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80', allergens: ['gluten', 'fish', 'dairy'], servings: 4 },
  { name: 'Zupa krem z dyni (10 porcji)', slug: 'zupa-krem-z-dyni-10-porcji', shortDescription: 'Aksamitny krem z dyni hokkaido z imbirem i prażonymi pestkami. Zestaw 10 porcji w pojemnikach cateringowych.', price: 8900, productType: 'catering', category: 'catering', color: '#c47c2d', isFeatured: false, imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', allergens: ['dairy'], dietary: ['vegetarian', 'gluten-free'], weight: '3 kg', servings: 10 },
  { name: 'Deska serów premium', slug: 'deska-serow-premium', shortDescription: 'Selekcja 6 gatunków serów krajowych i importowanych z winogronami, orzechami i miodem. Idealna dla 8-10 osób.', price: 11900, productType: 'catering', category: 'catering', color: '#b8922d', isFeatured: false, imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', allergens: ['dairy', 'nuts'], dietary: ['vegetarian'], weight: '900 g', servings: 8 },
  { name: 'Ciasto domowe bezglutenowe', slug: 'ciasto-domowe-bezglutenowe', shortDescription: 'Pyszne ciasto domowe w wersji bezglutenowej. Dostępne w wariantach: cytrynowe, czekoladowe lub malinowe.', price: 6500, productType: 'catering', category: 'desery', color: '#8b6914', isFeatured: false, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80', allergens: ['eggs', 'dairy'], dietary: ['vegetarian', 'gluten-free'], weight: '800 g', servings: 8 },
  { name: 'Tort okolicznościowy "Forest"', slug: 'tort-okolicznosciowy-forest', shortDescription: 'Elegancki tort wielopiętrowy z dekoracją leśną. Biszkopt waniliowy, krem mascarpone, sezonowe owoce. Do 50 porcji.', price: 24900, productType: 'catering', category: 'desery', color: '#4a7c59', isFeatured: true, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80', allergens: ['gluten', 'dairy', 'eggs'], dietary: ['vegetarian'], servings: 50 },
  { name: 'Candy Bar komplet (50 os.)', slug: 'candy-bar-komplet-50-os', shortDescription: 'Kompleksowy candy bar na 50 osób. Torty, muffiny, makaroniki, lizaki i dekoracje tematyczne. Obsługa 4h.', price: 59900, productType: 'event', category: 'desery', color: '#e07ac5', isFeatured: true, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80', allergens: ['gluten', 'dairy', 'eggs', 'nuts'], dietary: ['vegetarian'], servings: 50 },
  { name: 'Koktajl autorski "Forest Mule" (10 szt.)', slug: 'koktajl-forest-mule-10-szt', shortDescription: 'Autorski koktajl Forest Catering — wódka, likier malinowy, imbir i limonka. Zestaw 10 porcji na lód.', price: 14900, productType: 'bar', category: 'bar', color: '#8b1f3d', isFeatured: true, imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80', allergens: [], servings: 10 },
  { name: 'Bar mobilny obsługa (4h)', slug: 'bar-mobilny-obsluga-4h', shortDescription: 'Profesjonalny mobilny bar z dwoma barmanami na 4 godziny. Koktajle autorskie, drinki klasyczne i pokaz barmański.', price: 199900, productType: 'bar', category: 'bar', color: '#1f3d5a', isFeatured: true, imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80', allergens: [], servings: 50 },
  { name: 'Zestaw weselny "Rustic"', slug: 'zestaw-weselny-rustic', shortDescription: 'Kompletne menu weselne w stylu rustykalnym. 4 dania, aperitif, bar bezalkoholowy, zastawa i obsługa kelnerska.', price: 15900, productType: 'event', category: 'weselne', color: '#7c5a2d', isFeatured: true, imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80', allergens: ['gluten', 'dairy', 'eggs'], servings: 1 },
  { name: 'Menu degustacyjne 5-daniowe', slug: 'menu-degustacyjne-5-daniowe', shortDescription: 'Ekskluzywne menu degustacyjne 5 dań z parami win. Serwis fine dining, białe obrusy i kwiaty na stole.', price: 18900, productType: 'event', category: 'eventy', color: '#2d3d5a', isFeatured: true, imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80', allergens: ['gluten', 'dairy', 'fish', 'eggs'], servings: 1 },
  { name: 'Przekąski wegetariańskie mix', slug: 'przekaski-wegetarianskie-mix', shortDescription: 'Mix 20 wegetariańskich przekąsek: bruschetta, roladki warzywne, hummus z pitą i mini tarty szpinakowe.', price: 9900, productType: 'catering', category: 'catering', color: '#3d7c3d', isFeatured: false, imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80', allergens: ['gluten', 'dairy', 'sesame'], dietary: ['vegetarian', 'vegan'], servings: 8 },
  { name: 'Sushi catering (40 szt.)', slug: 'sushi-catering-40-szt', shortDescription: 'Zestaw 40 kawałków sushi: maki, nigiri i uramaki. Przygotowane przez doświadczonego sushi mastera.', price: 21900, productType: 'catering', category: 'catering', color: '#2d5a7c', isFeatured: false, imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', allergens: ['fish', 'shellfish', 'soy', 'sesame'], dietary: ['gluten-free'], servings: 8 },
  { name: 'Grillowanie plenerowe (20 os.)', slug: 'grillowanie-plenerowe-20-os', shortDescription: 'Kompletna obsługa grilla plenerowego na 20 osób. Kiełbasy, karkówka, warzywa z grilla, sałatki i pieczywo.', price: 8900, productType: 'event', category: 'eventy', color: '#7c3d1f', isFeatured: false, imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', allergens: ['gluten', 'mustard'], servings: 20 },
]

const EVENT_PACKAGES: Array<{
  name: string
  slug: string
  tier: 'basic' | 'premium' | 'catering-plus-bar'
  priceFrom: number
  features: string[]
  color: string
  sortOrder: number
}> = [
  {
    name: 'Pakiet Basic',
    slug: 'pakiet-basic',
    tier: 'basic',
    priceFrom: 8500,
    features: ['Dostawa na miejsce', 'Menu do wyboru (3 warianty)', 'Zastawa jednorazowa ekologiczna', 'Serwetki i sztućce'],
    color: '#4a7c59',
    sortOrder: 10,
  },
  {
    name: 'Pakiet Premium',
    slug: 'pakiet-premium',
    tier: 'premium',
    priceFrom: 12000,
    features: ['Dostawa + serwis kelnerski', 'Menu degustacyjne (5+ dań)', 'Zastawa porcelanowa', 'Dekoracja stołów', 'Koordynator eventu'],
    color: '#2d5a7c',
    sortOrder: 20,
  },
  {
    name: 'Pakiet Catering + Bar',
    slug: 'pakiet-catering-plus-bar',
    tier: 'catering-plus-bar',
    priceFrom: 16000,
    features: ['Wszystko z Pakietu Premium', 'Mobilny bar z barmanem', 'Koktajle autorskie', 'Pokaz barmański', 'Oświetlenie baru'],
    color: '#1f3d5a',
    sortOrder: 30,
  },
]

const GALLERY_ITEMS: Array<{
  alt: string
  category: 'wesela' | 'eventy-firmowe' | 'catering-prywatny' | 'bar' | 'dekoracje'
  sortOrder: number
  color: string
  imageUrl: string
}> = [
  { alt: 'Eleganckie nakrycie stołu weselnego', category: 'wesela', sortOrder: 10, color: '#7c5a2d', imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80' },
  { alt: 'Tort weselny Forest Catering', category: 'wesela', sortOrder: 20, color: '#4a7c59', imageUrl: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80' },
  { alt: 'Candy bar na wesele', category: 'wesela', sortOrder: 30, color: '#e07ac5', imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80' },
  { alt: 'Przyjęcie weselne w plenerze', category: 'wesela', sortOrder: 40, color: '#7c6a2d', imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80' },
  { alt: 'Konferencja firmowa z cateringiem', category: 'eventy-firmowe', sortOrder: 50, color: '#2d3d5a', imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80' },
  { alt: 'Gala firmowa — obsługa kelnerska', category: 'eventy-firmowe', sortOrder: 60, color: '#1f2d3d', imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80' },
  { alt: 'Team building z cateringiem plenerowym', category: 'eventy-firmowe', sortOrder: 70, color: '#3d5a2d', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80' },
  { alt: 'Catering na urodziny — bufet', category: 'catering-prywatny', sortOrder: 80, color: '#5a3d2d', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80' },
  { alt: 'Sushi catering na imprezę prywatną', category: 'catering-prywatny', sortOrder: 90, color: '#2d5a7c', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80' },
  { alt: 'Mobilny bar — koktajle i napoje', category: 'bar', sortOrder: 100, color: '#1f3d5a', imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80' },
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
  {
    title: '5 trendów cateringowych na 2026 rok',
    slug: '5-trendow-cateringowych-2026',
    excerpt: 'Sprawdź jakie trendy w cateringu zdominują 2026 rok — od kuchni fusion po zero waste i menu roślinne.',
    content: {
      root: {
        type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: [
          { type: 'heading', tag: 'h2', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Co zmienia się w cateringu?', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Branża cateringowa nieustannie się rozwija. Oto 5 kluczowych trendów, które będą dominować w 2026 roku i które już dziś wdrażamy w Forest Catering.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'heading', tag: 'h3', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: '1. Kuchnia zero waste', format: 1, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Minimalizacja odpadów staje się priorytetem. Używamy całych produktów, a resztki przetwarzamy na zupy i sosy.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'heading', tag: 'h3', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: '2. Menu roślinne jako standard', format: 1, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Opcje wegańskie i wegetariańskie to już nie dodatek, ale pełnoprawna część każdego menu eventowego.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'heading', tag: 'h3', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: '3. Interaktywne stacje food', format: 1, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Goście chcą uczestniczyć w przygotowaniu jedzenia — stacje sushi, taco bar czy grillowanie na żywo cieszą się ogromnym powodzeniem.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'heading', tag: 'h3', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: '4. Lokalne i sezonowe składniki', format: 1, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Współpraca z lokalnymi rolnikami i wybór produktów sezonowych to nie tylko trend, ale nasza filozofia od 10 lat.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'heading', tag: 'h3', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: '5. Personalizacja menu', format: 1, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Każdy event jest inny. Coraz więcej klientów oczekuje w pełni spersonalizowanego menu dostosowanego do diety i preferencji gości.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
        ],
      },
    },
  },
  {
    title: 'Jak wybrać catering na wesele — kompletny poradnik',
    slug: 'jak-wybrac-catering-na-wesele-poradnik',
    excerpt: 'Organizujesz wesele? Sprawdź na co zwrócić uwagę wybierając firmę cateringową — od menu po obsługę.',
    content: {
      root: {
        type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: [
          { type: 'heading', tag: 'h2', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Catering weselny — na co zwrócić uwagę?', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Wybór cateringu to jedna z najważniejszych decyzji przy organizacji wesela. Jedzenie jest tym, co goście zapamiętują najdłużej. Oto kompletny poradnik, który pomoże Ci podjąć właściwą decyzję.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'heading', tag: 'h3', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Degustacja — obowiązkowy krok', format: 1, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Zawsze proś o degustację przed podpisaniem umowy. Dobra firma cateringowa chętnie zaprosi Was do spróbowania proponowanego menu.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'heading', tag: 'h3', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Liczba gości a format serwisu', format: 1, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Do 80 gości — serwis kelnerski sprawdza się idealnie. Powyżej 100 osób rozważ mieszany format: bufet + kelnerzy.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'heading', tag: 'h3', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Zapasy na nieprzewidywalnych gości', format: 1, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Zawsze planuj 10% zapas jedzenia ponad deklarowaną liczbę gości. Lepiej mieć za dużo niż za mało.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
        ],
      },
    },
  },
  {
    title: 'Menu sezonowe: wiosna w Forest Catering',
    slug: 'menu-sezonowe-wiosna-forest-catering',
    excerpt: 'Wiosna w talerzu — odkryj nasze nowe sezonowe propozycje menu z lokalnych wiosennych składników.',
    content: {
      root: {
        type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: [
          { type: 'heading', tag: 'h2', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Wiosna na talerzu', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Wraz z wiosną wprowadzamy do naszego menu świeże, sezonowe składniki prosto od lokalnych rolników ze Szczecina i okolic. Oto nasze wiosenne propozycje.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'heading', tag: 'h3', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Wiosenne przystawki', format: 1, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'list', listType: 'bullet', start: 1, format: '', indent: 0, version: 1, direction: 'ltr', children: [
            { type: 'listitem', value: 1, format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Tatar z młodych warzyw z rzodkiewką i szczypiorkiem', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
            { type: 'listitem', value: 2, format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Krem ze szparagów z krewetkami', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
            { type: 'listitem', value: 3, format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Bruschetta z ricottą i pomidorkami koktajlowymi', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
          ] },
          { type: 'heading', tag: 'h3', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Sezonowe dania główne', format: 1, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Polędwica z młodymi warzywami, risotto ze szparagami i łososiem, a na deser — rabarbar z lodami waniliowymi.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
        ],
      },
    },
  },
  {
    title: 'Organizacja eventu firmowego krok po kroku',
    slug: 'organizacja-eventu-firmowego-krok-po-kroku',
    excerpt: 'Planujesz event firmowy? Poznaj sprawdzony schemat organizacji imprezy, który stosujemy w Forest Catering.',
    content: {
      root: {
        type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: [
          { type: 'heading', tag: 'h2', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Krok po kroku do udanego eventu', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Organizacja eventu firmowego wymaga dobrego planowania i doświadczonego partnera kulinarnego. Oto jak pracujemy z klientami korporacyjnymi w Forest Catering.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'heading', tag: 'h3', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Krok 1: Konsultacja i brief', format: 1, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Na pierwszym spotkaniu omawiamy charakter eventu, liczbę gości, budżet i preferencje żywieniowe. Odpowiadamy na pytania w ciągu 24h.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'heading', tag: 'h3', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Krok 2: Propozycja menu i degustacja', format: 1, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Przygotowujemy 3 warianty menu i zapraszamy na degustację. Wspólnie wybieramy dania, które najlepiej pasują do Twojego eventu.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'heading', tag: 'h3', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Krok 3: Logistyka i realizacja', format: 1, version: 1, detail: 0, mode: 'normal', style: '' }] },
          { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Przyjeżdżamy 2-3 godziny przed eventem, rozkładamy catering i zapewniamy obsługę przez cały czas trwania imprezy.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
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


function isTruthy(value: string | undefined): boolean {
  return value === '1' || value === 'true' || value === 'yes'
}

async function seedGlobalIfMissing({ payload, slug, data, force }: { payload: Awaited<ReturnType<typeof getPayload>>; slug: 'navigation' | 'site-settings'; data: Record<string, unknown>; force: boolean }) {
  const existing = (await payload.findGlobal({ slug })) as unknown as Record<string, unknown>
  const hasData = Object.entries(existing).some(([key, value]) => !['id', 'updatedAt', 'createdAt'].includes(key) && value != null && value !== '' && (!Array.isArray(value) || value.length > 0))

  if (force || !hasData) {
    await payload.updateGlobal({ slug, data })
  }
}

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

  await seedGlobalIfMissing({
    payload,
    slug: 'navigation',
    force: forceSeed,
    data: {
      headerItems: [
        { label: 'Oferta', url: '/oferta' },
        { label: 'Pakiety', url: '/pakiety' },
        { label: 'Eventy', url: '/eventy' },
        { label: 'Galeria', url: '/galeria' },
        { label: 'Blog', url: '/blog' },
        { label: 'Kontakt', url: '/kontakt' },
      ],
      footerColumns: [
        {
          title: 'Firma',
          links: [
            { label: 'Oferta', url: '/oferta' },
            { label: 'Pakiety', url: '/pakiety' },
            { label: 'Cennik', url: '/cennik' },
            { label: 'O nas', url: '/o-nas' },
            { label: 'Regulamin', url: '/regulamin' },
            { label: 'Polityka prywatności', url: '/polityka-prywatnosci' },
          ],
        },
        {
          title: 'Klient',
          links: [
            { label: 'Blog', url: '/blog' },
            { label: 'FAQ', url: '/faq' },
            { label: 'Galeria', url: '/galeria' },
            { label: 'Realizacje', url: '/galeria' },
          ],
        },
        {
          title: 'Kontakt',
          links: [
            { label: 'Napisz do nas', url: '/kontakt' },
            { label: 'Sklep', url: '/sklep' },
          ],
        },
      ],
    },
  })

  await seedGlobalIfMissing({
    payload,
    slug: 'site-settings',
    force: forceSeed,
    data: {
      companyName: 'Forest Catering',
      phone: '+48 123 456 789',
      email: 'kontakt@forestcatering.pl',
      address: { street: 'ul. Leśna 42', city: 'Szczecin', postalCode: '70-001' },
      businessHours: 'Pon-Pt: 8:00 - 18:00\nSob: 9:00 - 15:00\nNdz: Zamknięte',
      socialLinks: {
        facebook: 'https://facebook.com/forestcatering',
        instagram: 'https://instagram.com/forestcatering',
      },
      seoDefaults: {
        metaTitle: 'Forest Catering',
        metaDescription: 'Profesjonalny catering eventowy, firmowy i weselny.',
      },
    },
  })

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
      productType: product.productType,
      isAvailable: true,
      isFeatured: product.isFeatured,
      sortOrder: 0,
      ...(product.imageUrl ? { imageUrl: product.imageUrl } : {}),
      ...(product.allergens ? { allergens: product.allergens } : {}),
      ...(product.dietary ? { dietary: product.dietary } : {}),
      ...(product.weight ? { weight: product.weight } : {}),
      ...(product.servings ? { servings: product.servings } : {}),
    }

    if (existing.docs[0]) {
      await payload.update({ collection: 'products', id: existing.docs[0].id, data: data as never })
    } else {
      await payload.create({ collection: 'products', data: data as never })
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
    {
      title: 'Cennik',
      slug: 'cennik',
      sortOrder: 60,
      _status: 'published' as const,
      sections: [
        {
          blockType: 'hero',
          heading: 'Cennik',
          subheading: 'Przejrzyste ceny bez ukrytych kosztów',
          badge: 'Aktualne stawki 2026',
        },
        {
          blockType: 'pricing',
          heading: 'Nasze pakiety i ceny',
          packages: [
            { name: 'Pakiet Basic', price: 'od 85 zł/os.', featured: false, ctaText: 'Zapytaj o wycenę', ctaLink: '/kontakt?pakiet=basic', features: [{ text: 'Dostawa na miejsce' }, { text: 'Menu do wyboru (3 warianty)' }, { text: 'Zastawa jednorazowa ekologiczna' }, { text: 'Serwetki i sztućce' }] },
            { name: 'Pakiet Premium', price: 'od 120 zł/os.', featured: true, ctaText: 'Zapytaj o wycenę', ctaLink: '/kontakt?pakiet=premium', features: [{ text: 'Dostawa + serwis kelnerski' }, { text: 'Menu degustacyjne (5+ dań)' }, { text: 'Zastawa porcelanowa' }, { text: 'Dekoracja stołów' }, { text: 'Koordynator eventu' }] },
            { name: 'Catering + Bar', price: 'od 160 zł/os.', featured: false, ctaText: 'Zapytaj o wycenę', ctaLink: '/kontakt?pakiet=bar', features: [{ text: 'Wszystko z Premium' }, { text: 'Mobilny bar z barmanem' }, { text: 'Koktajle autorskie' }, { text: 'Pokaz barmański' }, { text: 'Oświetlenie baru' }] },
          ],
        },
      ],
    },
    {
      title: 'O nas',
      slug: 'o-nas',
      sortOrder: 70,
      _status: 'published' as const,
      sections: [
        {
          blockType: 'hero',
          heading: 'O Forest Catering',
          subheading: 'Gotujemy z pasją od ponad 10 lat',
          badge: 'Nasz zespół',
        },
        {
          blockType: 'about',
          badge: 'Nasza historia',
          heading: 'Kim jesteśmy?',
          content: {
            root: {
              type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: [
                { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Forest Catering to zespół doświadczonych kucharzy i pasjonatów dobrego jedzenia ze Szczecina. Specjalizujemy się w cateringu eventowym, firmowym i weselnym, zawsze stawiając na najwyższą jakość składników i indywidualne podejście do każdego klienta.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
                { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Współpracujemy z lokalnymi dostawcami, korzystamy z sezonowych składników i przygotowujemy wszystko ręcznie — od pieczywa po desery. Każde zamówienie traktujemy jak wyzwanie, któremu chcemy sprostać na najwyższym poziomie.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
              ],
            },
          },
          highlights: [
            { text: 'Ponad 10 lat doświadczenia' },
            { text: 'Świeże lokalne składniki' },
            { text: 'Ręczne przygotowanie' },
            { text: 'Indywidualne menu' },
            { text: 'Doświadczony zespół' },
            { text: 'Ponad 500 eventów' },
          ],
          ctaText: 'Skontaktuj się z nami',
          ctaLink: '/kontakt',
        },
      ],
    },
    {
      title: 'Polityka prywatności',
      slug: 'polityka-prywatnosci',
      sortOrder: 80,
      _status: 'published' as const,
      sections: [
        {
          blockType: 'legalText',
          heading: 'Polityka prywatności',
          effectiveDate: '2026-02-19',
          content: {
            root: {
              type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: [
                { type: 'heading', tag: 'h2', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: '1. Administrator danych', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
                { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Administratorem Twoich danych osobowych jest Forest Catering, ul. Leśna 42, 70-001 Szczecin. Dane przetwarzane są zgodnie z RODO.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
                { type: 'heading', tag: 'h2', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: '2. Cel przetwarzania', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
                { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Dane zbieramy wyłącznie w celu realizacji zamówień, odpowiedzi na zapytania oraz przesyłania informacji marketingowych (za zgodą).', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
                { type: 'heading', tag: 'h2', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: '3. Twoje prawa', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
                { type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'text', text: 'Masz prawo dostępu, sprostowania, usunięcia i ograniczenia przetwarzania danych. Skontaktuj się z nami pod adresem kontakt@forestcatering.pl.', format: 0, version: 1, detail: 0, mode: 'normal', style: '' }] },
              ],
            },
          },
        },
      ],
    },
    {
      title: 'FAQ — Często zadawane pytania',
      slug: 'faq',
      sortOrder: 90,
      _status: 'published' as const,
      sections: [
        {
          blockType: 'hero',
          heading: 'Najczęstsze pytania',
          subheading: 'Znajdź odpowiedzi na pytania dotyczące naszych usług',
        },
        {
          blockType: 'faq',
          heading: 'FAQ',
          items: [
            { question: 'Jak złożyć zamówienie na catering?', answer: 'Skontaktuj się z nami przez formularz kontaktowy lub telefonicznie. Odpowiemy w ciągu 24h z propozycją menu i wyceną.' },
            { question: 'Jaki jest minimalny czas na zamówienie cateringu?', answer: 'Standardowo potrzebujemy min. 3 dni roboczych. Na wesela i duże eventy — min. 2 tygodnie. Staramy się jednak działać elastycznie.' },
            { question: 'Czy oferujecie degustacje?', answer: 'Tak! Dla zamówień powyżej 20 osób oferujemy bezpłatną degustację wybranego menu. Umów się telefonicznie lub przez formularz.' },
            { question: 'Czy dostarczacie poza Szczecin?', answer: 'Tak, obsługujemy całe Pomorze Zachodnie oraz województwa sąsiednie. Koszt transportu zależy od odległości.' },
            { question: 'Czy macie opcje wegetariańskie i wegańskie?', answer: 'Oczywiście! Przygotowujemy pełne menu wegetariańskie, wegańskie i bezglutenowe. Poinformuj nas o dietach gości przy zamówieniu.' },
            { question: 'Co wliczone jest w cenę pakietu?', answer: 'Standardowo: przygotowanie posiłków, transport, zastawa i serwowanie. Serwis kelnerski dostępny w pakietach Premium i wyższych.' },
          ],
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




  const ofertaPage = await payload.find({ collection: 'pages', where: { slug: { equals: 'oferta' } }, limit: 1 })
  const pakietyPage = await payload.find({ collection: 'pages', where: { slug: { equals: 'pakiety' } }, limit: 1 })
  if (ofertaPage.docs[0] && !pakietyPage.docs[0]) {
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Pakiety',
        slug: 'pakiety',
        parent: ofertaPage.docs[0].id,
        sortOrder: 11,
        _status: 'published',
        sections: [
          {
            blockType: 'pricing',
            heading: 'Pakiety oferty',
            packages: [
              { name: 'Start', price: 'od 45 zł/os.', ctaText: 'Zapytaj o wycenę', ctaLink: '/kontakt' },
              { name: 'Biznes', price: 'od 85 zł/os.', featured: true, ctaText: 'Zapytaj o wycenę', ctaLink: '/kontakt' },
            ],
          },
        ],
      } as never,
    })
  }

  const galleryMedia = await payload.find({ collection: 'media', limit: 12, sort: '-createdAt' })
  if (galleryMedia.docs.length && forceSeed) {
    const galleryPage = await payload.find({ collection: 'pages', where: { path: { equals: 'home/galeria' } }, limit: 1, depth: 0 })
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

  // ─── Event Packages ──────────────────────────────────────────
  for (const pkg of EVENT_PACKAGES) {
    const imgBuffer = await generatePlaceholder(pkg.name, pkg.color)
    const filename = `event-pkg-${pkg.slug}.png`
    const filePath = path.join(MEDIA_DIR, filename)
    fs.writeFileSync(filePath, imgBuffer)

    const mediaExisting = await payload.find({ collection: 'media', where: { alt: { equals: pkg.name } }, limit: 1 })
    const pkgMedia = mediaExisting.docs[0]
      ? mediaExisting.docs[0]
      : await payload.create({
          collection: 'media',
          data: {
            alt: pkg.name,
            imageSlug: slugifySafe(pkg.slug) || `event-pkg-${Date.now()}`,
          },
          draft: false,
          file: {
            data: imgBuffer,
            name: filename,
            mimetype: 'image/png',
            size: imgBuffer.length,
          },
        })

    const existingPkg = await payload.find({ collection: 'event-packages', where: { slug: { equals: pkg.slug } }, limit: 1 })
    const pkgData = {
      name: pkg.name,
      slug: pkg.slug,
      tier: pkg.tier,
      priceFrom: pkg.priceFrom,
      features: pkg.features.map((feature) => ({ feature })),
      image: pkgMedia.id,
      sortOrder: pkg.sortOrder,
    }
    if (existingPkg.docs[0]) {
      await payload.update({ collection: 'event-packages', id: existingPkg.docs[0].id, data: pkgData })
    } else {
      await payload.create({ collection: 'event-packages', data: pkgData })
    }
  }

  // ─── Gallery Items ────────────────────────────────────────────
  for (const item of GALLERY_ITEMS) {
    const imgBuffer = await generatePlaceholder(item.alt, item.color)
    const slugBase = slugifySafe(item.alt) || `gallery-${item.sortOrder}`
    const filename = `gallery-${slugBase}.png`
    const filePath = path.join(MEDIA_DIR, filename)
    fs.writeFileSync(filePath, imgBuffer)

    const mediaExisting = await payload.find({ collection: 'media', where: { alt: { equals: item.alt } }, limit: 1 })
    const itemMedia = mediaExisting.docs[0]
      ? mediaExisting.docs[0]
      : await payload.create({
          collection: 'media',
          data: {
            alt: item.alt,
            imageSlug: slugBase,
          },
          draft: false,
          file: {
            data: imgBuffer,
            name: filename,
            mimetype: 'image/png',
            size: imgBuffer.length,
          },
        })

    const existingItem = await payload.find({ collection: 'gallery-items', where: { alt: { equals: item.alt } }, limit: 1 })
    const itemData = {
      image: itemMedia.id,
      alt: item.alt,
      category: item.category,
      sortOrder: item.sortOrder,
    }
    if (existingItem.docs[0]) {
      await payload.update({ collection: 'gallery-items', id: existingItem.docs[0].id, data: itemData })
    } else {
      await payload.create({ collection: 'gallery-items', data: itemData })
    }
  }

  console.log('✅ Seed complete')
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})
