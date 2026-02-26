import payload from 'payload'
import config from '../../payload.config'
import type { Page } from '../payload-types'

type PageSection = Page['sections'][number]

type SeedPage = {
  title: string
  slug: string
  sortOrder: number
  sections: PageSection[]
}

const createRichText = (text: string): Extract<PageSection, { blockType: 'richText' }>['content'] => ({
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
        children: [
          {
            type: 'text',
            text,
            format: 0,
            version: 1,
            detail: 0,
            mode: 'normal',
            style: '',
          },
        ],
      },
    ],
  },
})

const makeSeedPages = (mediaId: number): SeedPage[] => [
  {
    title: 'Strona główna',
    slug: 'home',
    sortOrder: 0,
    sections: [
      {
        blockType: 'hero',
        heading: 'Forest Catering na każdą okazję',
        subheading: 'Kompleksowa obsługa eventów firmowych, wesel i przyjęć prywatnych.',
        badge: '🌿 Catering premium',
        ctaText: 'Poznaj ofertę',
        ctaLink: '/oferta',
        secondaryCtaText: 'Skontaktuj się',
        secondaryCtaLink: '/kontakt',
        showScrollIndicator: true,
      },
      {
        blockType: 'stats',
        items: [
          { value: 1200, suffix: '+', label: 'Obsłużonych wydarzeń' },
          { value: 10, suffix: '+', label: 'Lat doświadczenia' },
          { value: 50000, suffix: '+', label: 'Wydanych porcji' },
        ],
      },
      {
        blockType: 'services',
        heading: 'Nasze usługi',
        items: [
          { emoji: '🏢', title: 'Eventy firmowe', description: 'Pełna obsługa cateringowa konferencji, gali i spotkań biznesowych.' },
          { emoji: '💍', title: 'Wesela', description: 'Menu dopasowane do stylu uroczystości i preferencji gości.' },
          { emoji: '🎉', title: 'Imprezy prywatne', description: 'Przyjęcia rodzinne, jubileusze i eventy plenerowe.' },
        ],
      },
      {
        blockType: 'featuredProducts',
        heading: 'Popularne propozycje menu',
        limit: 6,
        linkText: 'Zobacz wszystkie',
        linkUrl: '/oferta',
      },
      {
        blockType: 'about',
        heading: 'Tworzymy smak, który zapamiętasz',
        content: createRichText('Łączymy sezonowe składniki, sprawdzoną logistykę i profesjonalny serwis, aby każde wydarzenie przebiegało bez stresu.'),
        highlights: [
          { text: 'Indywidualne menu' },
          { text: 'Doświadczona obsługa' },
          { text: 'Terminowa realizacja' },
        ],
        ctaText: 'Poznaj nas bliżej',
        ctaLink: '/o-nas',
      },
      {
        blockType: 'galleryFull',
        heading: 'Realizacje',
        items: [
          { image: mediaId, alt: 'Przykładowa realizacja cateringu', category: 'realizacje', categoryLabel: 'Realizacje' },
        ],
      },
      {
        blockType: 'testimonials',
        heading: 'Opinie klientów',
        items: [
          { quote: 'Fantastyczna organizacja i świetne jedzenie.', author: 'Anna K.', event: 'Wesele', rating: 5 },
          { quote: 'Pełen profesjonalizm od pierwszego kontaktu.', author: 'Marek P.', event: 'Event firmowy', rating: 5 },
        ],
      },
      {
        blockType: 'steps',
        heading: 'Jak współpracujemy',
        steps: [
          { emoji: '1️⃣', title: 'Konsultacja', description: 'Rozmawiamy o potrzebach i budżecie.' },
          { emoji: '2️⃣', title: 'Oferta', description: 'Przygotowujemy dopasowaną propozycję menu.' },
          { emoji: '3️⃣', title: 'Realizacja', description: 'Dostarczamy i obsługujemy wydarzenie.' },
        ],
      },
      {
        blockType: 'cta',
        heading: 'Planujesz wydarzenie?',
        text: 'Napisz do nas, a przygotujemy wycenę dopasowaną do Twoich potrzeb.',
        buttonText: 'Przejdź do kontaktu',
        buttonLink: '/kontakt',
      },
    ],
  },
  {
    title: 'Oferta',
    slug: 'oferta',
    sortOrder: 10,
    sections: [
      { blockType: 'hero', heading: 'Oferta Forest Catering', subheading: 'Obsługujemy wydarzenia małe i duże, zawsze z dbałością o detale.' },
      {
        blockType: 'offerCards',
        heading: 'Wybierz zakres obsługi',
        cards: [
          {
            title: 'Catering firmowy',
            priceFrom: 'od 79 zł/os.',
            features: [{ text: 'Menu lunchowe i bankietowe' }, { text: 'Opcje wege i bez glutenu' }],
            ctaText: 'Zapytaj o ofertę',
            ctaLink: '/kontakt',
          },
        ],
      },
      {
        blockType: 'services',
        items: [
          { emoji: '📦', title: 'Dostawa', description: 'Terminowa dostawa na miejsce wydarzenia.' },
          { emoji: '👨‍🍳', title: 'Obsługa', description: 'Profesjonalny zespół kuchni i serwisu.' },
        ],
      },
      { blockType: 'cta', heading: 'Potrzebujesz indywidualnej wyceny?', buttonText: 'Skontaktuj się', buttonLink: '/kontakt' },
    ],
  },
  {
    title: 'Pakiety',
    slug: 'pakiety',
    sortOrder: 20,
    sections: [
      { blockType: 'hero', heading: 'Pakiety cateringowe', subheading: 'Gotowe warianty, które możesz łatwo dopasować do typu wydarzenia.' },
      {
        blockType: 'pricing',
        heading: 'Dostępne pakiety',
        packages: [
          { name: 'Standard', price: '99 zł/os.', features: [{ text: 'Przystawki i danie główne' }] },
          { name: 'Premium', price: '149 zł/os.', features: [{ text: 'Rozszerzone menu i desery' }], featured: true },
        ],
      },
      {
        blockType: 'faq',
        items: [
          { question: 'Czy można zmienić menu?', answer: 'Tak, każdy pakiet można rozszerzyć o dodatkowe pozycje.' },
          { question: 'Jaka jest minimalna liczba gości?', answer: 'Pakiety realizujemy od 20 osób.' },
        ],
      },
      { blockType: 'cta', heading: 'Nie wiesz, który pakiet wybrać?', buttonText: 'Zapytaj doradcę', buttonLink: '/kontakt' },
    ],
  },
  {
    title: 'Cennik',
    slug: 'cennik',
    sortOrder: 30,
    sections: [
      {
        blockType: 'pricing',
        heading: 'Cennik usług',
        packages: [
          { name: 'Bufet klasyczny', price: '89 zł/os.', features: [{ text: 'Zestaw podstawowy' }] },
          { name: 'Bufet premium', price: '129 zł/os.', features: [{ text: 'Zestaw rozszerzony' }] },
        ],
      },
      {
        blockType: 'faq',
        items: [
          { question: 'Czy cena obejmuje obsługę?', answer: 'Tak, cena może obejmować obsługę po wcześniejszym ustaleniu.' },
        ],
      },
      { blockType: 'cta', heading: 'Chcesz szczegółową kalkulację?', buttonText: 'Napisz do nas', buttonLink: '/kontakt' },
    ],
  },
  {
    title: 'Realizacje',
    slug: 'realizacje',
    sortOrder: 40,
    sections: [
      { blockType: 'galleryFull', heading: 'Nasze realizacje', items: [{ image: mediaId, alt: 'Galeria realizacji', category: 'eventy', categoryLabel: 'Eventy' }] },
      {
        blockType: 'testimonials',
        items: [{ quote: 'Goście byli zachwyceni jakością dań i serwisu.', author: 'Karolina S.', event: 'Jubileusz', rating: 5 }],
      },
      { blockType: 'cta', heading: 'Chcesz podobną realizację?', buttonText: 'Skontaktuj się', buttonLink: '/kontakt' },
    ],
  },
  {
    title: 'O nas',
    slug: 'o-nas',
    sortOrder: 50,
    sections: [
      {
        blockType: 'about',
        heading: 'Poznaj Forest Catering',
        content: createRichText('Jesteśmy zespołem pasjonatów gastronomii i organizacji wydarzeń. Dbamy o smak, estetykę i sprawną realizację.'),
      },
      {
        blockType: 'team',
        heading: 'Nasz zespół',
        people: [
          {
            photo: mediaId,
            name: 'Joanna Nowak',
            role: 'Event Manager',
            bio: 'Koordynuje realizacje i dba o każdy detal wydarzenia.',
          },
        ],
      },
      {
        blockType: 'partners',
        heading: 'Partnerzy',
        items: [{ logo: mediaId, name: 'Partner strategiczny', url: 'https://example.com' }],
        variant: 'grid',
      },
      { blockType: 'cta', heading: 'Porozmawiajmy o Twoim wydarzeniu', buttonText: 'Kontakt', buttonLink: '/kontakt' },
    ],
  },
  {
    title: 'Kontakt',
    slug: 'kontakt',
    sortOrder: 60,
    sections: [
      { blockType: 'contactForm', heading: 'Skontaktuj się z nami', subheading: 'Opisz wydarzenie, a przygotujemy propozycję współpracy.' },
      {
        blockType: 'mapArea',
        heading: 'Obszar działania',
        description: 'Działamy głównie w województwie zachodniopomorskim i okolicach.',
        embedUrl: 'https://maps.google.com/maps?q=Szczecin&z=11&output=embed',
        cities: [{ name: 'Szczecin' }, { name: 'Police' }, { name: 'Goleniów' }],
      },
      {
        blockType: 'faq',
        items: [
          { question: 'Jak szybko odpowiadacie na zapytania?', answer: 'Zwykle wracamy z odpowiedzią w ciągu 24 godzin.' },
        ],
      },
      { blockType: 'cta', heading: 'Masz pilne zapytanie?', buttonText: 'Napisz teraz', buttonLink: '/kontakt' },
    ],
  },
  {
    title: 'Polityka prywatności',
    slug: 'polityka-prywatnosci',
    sortOrder: 70,
    sections: [
      { blockType: 'legalText', heading: 'Polityka prywatności', effectiveDate: new Date().toISOString(), content: createRichText('Szanujemy prywatność użytkowników. Dane przetwarzamy wyłącznie w celach związanych z realizacją usług i obsługą zapytań.') },
      { blockType: 'cta', heading: 'Masz pytania dotyczące danych?', buttonText: 'Skontaktuj się', buttonLink: '/kontakt' },
    ],
  },
  {
    title: 'Regulamin',
    slug: 'regulamin',
    sortOrder: 80,
    sections: [
      { blockType: 'legalText', heading: 'Regulamin', effectiveDate: new Date().toISOString(), content: createRichText('Regulamin określa zasady współpracy, zamówień oraz odpowiedzialność stron podczas realizacji usług cateringowych.') },
      { blockType: 'cta', heading: 'Potrzebujesz wyjaśnień?', buttonText: 'Napisz do nas', buttonLink: '/kontakt' },
    ],
  },
  {
    title: 'FAQ',
    slug: 'faq',
    sortOrder: 90,
    sections: [
      {
        blockType: 'faq',
        items: [
          { question: 'Czy przygotowujecie menu wegetariańskie?', answer: 'Tak, oferujemy pełne warianty wege i wegańskie.' },
          { question: 'Czy realizujecie małe wydarzenia?', answer: 'Tak, obsługujemy także kameralne spotkania.' },
        ],
      },
      { blockType: 'contactForm', heading: 'Nie znalazłeś odpowiedzi?', subheading: 'Wyślij nam pytanie przez formularz kontaktowy.' },
      { blockType: 'cta', heading: 'Zadaj pytanie', buttonText: 'Przejdź do kontaktu', buttonLink: '/kontakt' },
    ],
  },
]

const run = async (): Promise<void> => {
  await payload.init({ config })

  const mediaResult = await payload.find({
    collection: 'media',
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const mediaDoc = mediaResult.docs[0]

  if (!mediaDoc) {
    throw new Error('Brak rekordów w kolekcji media. Dodaj co najmniej jedno media przed uruchomieniem seeda.')
  }

  const pages = makeSeedPages(mediaDoc.id)

  let createdCount = 0
  let skippedCount = 0

  for (const page of pages) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      skippedCount += 1
      console.log(`skipped: ${page.slug}`)
      continue
    }

    await payload.create({
      collection: 'pages',
      data: {
        title: page.title,
        slug: page.slug,
        sortOrder: page.sortOrder,
        sections: page.sections,
        _status: 'published',
      },
      overrideAccess: true,
    })

    createdCount += 1
    console.log(`created: ${page.slug}`)
  }

  console.log(`summary: created=${createdCount}, skipped=${skippedCount}, total=${pages.length}`)
}

run()
  .then(() => {
    process.exit(0)
  })
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
