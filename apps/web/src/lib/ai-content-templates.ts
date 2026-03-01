// AI Content Templates — PL templates per blockType/fieldPath/tone
// Minimum 3 variants per field per tone

type Tone = 'professional' | 'friendly' | 'luxury'

export const templates: Record<string, Record<string, Record<Tone, string[]>>> = {
  hero: {
    heading: {
      professional: [
        'Catering na najwyższym poziomie',
        'Profesjonalny catering dla Twojej firmy',
        'Kompleksowa obsługa cateringowa',
        'Sprawdzony partner w gastronomii',
      ],
      friendly: [
        'Pyszne jedzenie na każdą okazję!',
        'Gotujemy z pasją — dla Ciebie!',
        'Smaki, które pokochasz od pierwszego kęsa',
        'Zamów catering i ciesz się smakiem!',
      ],
      luxury: [
        'Ekskluzywny catering dla wymagających',
        'Kulinarna perfekcja w każdym detalu',
        'Gdzie smak spotyka elegancję',
        'Wyjątkowe doznania kulinarne',
      ],
    },
    subheading: {
      professional: [
        'Dostarczamy najwyższej jakości posiłki dla firm i instytucji na terenie całego regionu.',
        'Wieloletnie doświadczenie w obsłudze eventów korporacyjnych i prywatnych.',
        'Zaufaj profesjonalistom — od menu po serwis, wszystko w jednym miejscu.',
      ],
      friendly: [
        'Świeże składniki, domowe receptury i dużo miłości na talerzu 🍽️',
        'Każde zamówienie przygotowujemy z sercem — bo jedzenie to radość!',
        'Nie musisz gotować — my zajmiemy się wszystkim za Ciebie!',
      ],
      luxury: [
        'Wyselekcjonowane składniki, mistrzowskie wykonanie, niezapomniane wrażenia.',
        'Tworzymy wyjątkowe doświadczenia kulinarne dla najbardziej wymagających gości.',
        'Premium catering — bo Twoje wydarzenie zasługuje na to, co najlepsze.',
      ],
    },
    ctaText: {
      professional: [
        'Zapytaj o ofertę',
        'Skontaktuj się z nami',
        'Zamów wycenę',
      ],
      friendly: [
        'Sprawdź menu!',
        'Zamów teraz 😋',
        'Zobacz co mamy!',
      ],
      luxury: [
        'Odkryj ofertę premium',
        'Umów konsultację',
        'Poznaj nasze menu',
      ],
    },
  },

  cta: {
    heading: {
      professional: [
        'Skontaktuj się z nami już dziś',
        'Rozpocznij współpracę',
        'Zapytaj o szczegóły oferty',
      ],
      friendly: [
        'Masz ochotę na coś pysznego?',
        'Daj znać — chętnie pomożemy!',
        'Zamówienie to pestka!',
      ],
      luxury: [
        'Zarezerwuj swoje wyjątkowe wydarzenie',
        'Stwórz niezapomniane chwile',
        'Twoje ekskluzywne doświadczenie czeka',
      ],
    },
    text: {
      professional: [
        'Wypełnij formularz kontaktowy lub zadzwoń, a nasz zespół przygotuje spersonalizowaną ofertę.',
        'Jesteśmy do dyspozycji — odpowiemy w ciągu 24 godzin roboczych.',
        'Skontaktuj się z naszym działem obsługi, aby omówić szczegóły Twojego zamówienia.',
      ],
      friendly: [
        'Napisz do nas albo zadzwoń — razem ułożymy idealne menu!',
        'Masz pytania? Nie krępuj się! Jesteśmy tu, żeby pomóc 😊',
        'Jedna wiadomość dzieli Cię od pysznego cateringu!',
      ],
      luxury: [
        'Nasz concierge kulinarny z przyjemnością dopracuje każdy szczegół Twojego wydarzenia.',
        'Skontaktuj się z nami, aby otrzymać spersonalizowaną propozycję menu premium.',
        'Zapraszamy do kontaktu — stworzymy coś wyjątkowego specjalnie dla Ciebie.',
      ],
    },
    buttonText: {
      professional: [
        'Wyślij zapytanie',
        'Skontaktuj się',
        'Zamów ofertę',
      ],
      friendly: [
        'Napisz do nas!',
        'Zamów teraz',
        'Zaczynamy!',
      ],
      luxury: [
        'Zarezerwuj termin',
        'Umów spotkanie',
        'Rozpocznij',
      ],
    },
  },

  services: {
    heading: {
      professional: [
        'Nasze usługi cateringowe',
        'Pełna oferta gastronomiczna',
        'Zakres naszych usług',
      ],
      friendly: [
        'Co dla Ciebie przygotujemy?',
        'Zobacz, co potrafimy!',
        'Nasze specjalności',
      ],
      luxury: [
        'Portfolio usług premium',
        'Ekskluzywna oferta kulinarna',
        'Nasze wyrafinowane usługi',
      ],
    },
    'items.title': {
      professional: [
        'Catering firmowy',
        'Obsługa eventów',
        'Dostawa posiłków',
      ],
      friendly: [
        'Pyszne lunche biurowe',
        'Imprezy i eventy',
        'Codzienne obiady',
      ],
      luxury: [
        'Bankiety i gale',
        'Kolacje degustacyjne',
        'Prywatne przyjęcia',
      ],
    },
  },

  about: {
    heading: {
      professional: [
        'O naszej firmie',
        'Kim jesteśmy',
        'Nasza historia i misja',
      ],
      friendly: [
        'Poznaj nas bliżej!',
        'Kilka słów o nas',
        'To my — Twój catering!',
      ],
      luxury: [
        'Nasza filozofia kulinarna',
        'Tradycja i nowoczesność',
        'Za kulisami naszej kuchni',
      ],
    },
    badge: {
      professional: [
        'Od 2010 roku',
        'Ponad 10 lat doświadczenia',
        'Certyfikowany partner',
      ],
      friendly: [
        'Z pasją od lat!',
        'Gotujemy z sercem ❤️',
        'Twój zaufany catering',
      ],
      luxury: [
        'Premium Quality',
        'Exclusive Catering',
        'Culinary Excellence',
      ],
    },
  },

  pricing: {
    heading: {
      professional: [
        'Cennik usług cateringowych',
        'Nasze pakiety cenowe',
        'Oferta i ceny',
      ],
      friendly: [
        'Ile to kosztuje?',
        'Przejrzyste ceny',
        'Wybierz swój pakiet!',
      ],
      luxury: [
        'Pakiety premium',
        'Ekskluzywne opcje',
        'Inwestycja w smak',
      ],
    },
    subheading: {
      professional: [
        'Wybierz pakiet dopasowany do potrzeb Twojego wydarzenia lub firmy.',
        'Transparentne ceny bez ukrytych kosztów — wszystko w jednej ofercie.',
        'Elastyczne pakiety z możliwością indywidualnej konfiguracji.',
      ],
      friendly: [
        'Mamy coś dla każdego budżetu — zerknij!',
        'Proste, uczciwe ceny — żadnych niespodzianek 😉',
        'Znajdź idealny pakiet dla siebie i swoich gości!',
      ],
      luxury: [
        'Każdy pakiet to starannie skomponowane doświadczenie kulinarne.',
        'Inwestycja w wyjątkowy smak i niezapomnianą obsługę.',
        'Dopasujemy każdy detal do Twoich oczekiwań.',
      ],
    },
  },

  contactForm: {
    heading: {
      professional: [
        'Formularz kontaktowy',
        'Skontaktuj się z nami',
        'Wyślij zapytanie',
      ],
      friendly: [
        'Napisz do nas!',
        'Masz pytania? Pisz śmiało!',
        'Chętnie pomożemy!',
      ],
      luxury: [
        'Zarezerwuj konsultację',
        'Skontaktuj się z naszym zespołem',
        'Rozpocznij współpracę',
      ],
    },
    subheading: {
      professional: [
        'Wypełnij formularz, a odpowiemy w ciągu jednego dnia roboczego.',
        'Opisz swoje potrzeby — przygotujemy spersonalizowaną ofertę.',
        'Nasz zespół jest do Twojej dyspozycji od poniedziałku do piątku.',
      ],
      friendly: [
        'Odezwij się — z przyjemnością odpowiemy na wszystkie pytania!',
        'Potrzebujesz pomocy z wyborem menu? Daj znać!',
        'Wypełnij formularz, a szybko się odezwiemy 🙂',
      ],
      luxury: [
        'Nasz concierge skontaktuje się z Tobą w celu omówienia szczegółów.',
        'Zapraszamy do kontaktu — każde zapytanie traktujemy priorytetowo.',
        'Opisz swoją wizję, a my zamienimy ją w kulinarną rzeczywistość.',
      ],
    },
  },
}

/** Pick N random items from an array (Fisher-Yates partial shuffle) */
export function pickRandom<T>(arr: T[], count = 3): T[] {
  if (arr.length <= count) return [...arr]
  const copy = [...arr]
  for (let i = copy.length - 1; i > copy.length - 1 - count; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(-count)
}

/** Get template suggestions for a given block type, field path, and tone */
export function getTemplateSuggestions(
  blockType: string,
  fieldPath: string,
  tone: 'professional' | 'friendly' | 'luxury',
): string[] {
  const blockTemplates = templates[blockType]
  if (!blockTemplates) return []
  const fieldTemplates = blockTemplates[fieldPath]
  if (!fieldTemplates) return []
  const toneTemplates = fieldTemplates[tone]
  if (!toneTemplates || toneTemplates.length === 0) return []
  return pickRandom(toneTemplates, 3)
}
