import Link from 'next/link'
import Image from 'next/image'
import { AnimatedSection, AnimatedItem } from '@/components/ui/AnimatedSection'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { getPayload } from '@/lib/payload-client'
import { formatPrice } from '@/lib/format'
import { getMediaUrl } from '@/lib/media'

const galleryPreviewImages = [
  { cat: 'Wesela', src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80' },
  { cat: 'Eventy firmowe', src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80' },
  { cat: 'Catering prywatny', src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80' },
  { cat: 'Obsługa baru', src: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80' },
  { cat: 'Dekoracje', src: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80' },
  { cat: 'Menu degustacyjne', src: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&q=80' },
]

const services = [
  {
    emoji: '🍽️',
    title: 'Catering firmowy',
    description: 'Profesjonalna obsługa spotkań biznesowych, konferencji i codziennych dostaw do biura.',
    href: '/oferta',
  },
  {
    emoji: '🎉',
    title: 'Eventy prywatne',
    description: 'Kompleksowa obsługa imprez okolicznościowych, urodzin i przyjęć w plenerze.',
    href: '/eventy',
  },
  {
    emoji: '💒',
    title: 'Wesela',
    description: 'Wyjątkowe menu weselne dopasowane do Waszych potrzeb i stylu uroczystości.',
    href: '/eventy',
  },
  {
    emoji: '🍸',
    title: 'Obsługa baru',
    description: 'Mobilny bar z profesjonalnymi barmanami, autorskimi koktajlami i pokazami.',
    href: '/eventy',
  },
]

const testimonials = [
  {
    quote: 'Forest Catering zapewnił niesamowite jedzenie na nasze wesele. Goście do dziś wspominają te dania!',
    author: 'Anna i Marcin',
    event: 'Wesele',
  },
  {
    quote: 'Profesjonalne podejście, elastyczność i pyszne jedzenie. Stały partner naszej firmy.',
    author: 'Tomasz K.',
    event: 'Catering firmowy',
  },
  {
    quote: 'Obsługa baru na naszym evencie firmowym była na najwyższym poziomie!',
    author: 'Marta W.',
    event: 'Event firmowy',
  },
]

type FeaturedProduct = {
  id: number
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  shortDescription?: string | null
  images?: Array<{ image: { url?: string } | string }>
}

export default async function HomePage() {
  let featuredProducts: FeaturedProduct[] = []
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'products',
      where: { isFeatured: { equals: true }, isAvailable: { equals: true } },
      limit: 6,
      sort: 'sortOrder',
      depth: 2,
    })
    featuredProducts = result.docs as typeof featuredProducts
  } catch {
    // Payload not available during build
  }

  return (
    <>
      {/* Section 1: Hero */}
      <section className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <AnimatedSection>
            <span className="mb-6 inline-block rounded-full border border-accent/30 bg-forest-700/50 px-4 py-1.5 text-sm text-accent">
              🌲 Catering premium w Szczecinie
            </span>
          </AnimatedSection>
          <AnimatedSection>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-cream sm:text-5xl md:text-7xl">
              Wyśmienity{' '}
              <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
                catering
              </span>
              <br />na każdą okazję
            </h1>
          </AnimatedSection>
          <AnimatedSection>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-forest-200 md:text-xl">
              Eventy firmowe · Wesela · Catering prywatny · Obsługa baru
            </p>
          </AnimatedSection>
          <AnimatedSection>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/sklep"
                className="inline-flex items-center rounded-lg bg-accent px-8 py-3.5 text-base font-semibold text-forest-950 transition hover:scale-105 hover:bg-accent-light"
              >
                Zamów catering
              </Link>
              <Link
                href="/kontakt"
                className="inline-flex items-center rounded-lg border border-cream px-8 py-3.5 text-base font-semibold text-cream transition hover:bg-cream/10"
              >
                Zapytaj o event
              </Link>
            </div>
          </AnimatedSection>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-cream/50">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Section 2: Statystyki */}
      <section className="bg-forest-900 py-20">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 md:grid-cols-4">
          <AnimatedCounter value={500} suffix="+" label="Zrealizowanych eventów" />
          <AnimatedCounter value={10} suffix="+" label="Lat doświadczenia" />
          <AnimatedCounter value={50} suffix="+" label="Pozycji w menu" />
          <AnimatedCounter value={100} suffix="%" label="Zadowolonych klientów" />
        </div>
      </section>

      {/* Section 3: Usługi */}
      <section className="bg-forest-950 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <AnimatedSection>
            <h2 className="text-center text-3xl font-bold text-cream md:text-4xl">
              Czym się zajmujemy
            </h2>
            <div className="mx-auto mt-2 h-1 w-16 rounded bg-accent" />
          </AnimatedSection>
          <AnimatedSection stagger>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((svc) => (
                <AnimatedItem key={svc.title}>
                  <div className="group rounded-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl transition hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-accent/10">
                    <span className="text-5xl">{svc.emoji}</span>
                    <h3 className="mt-4 text-lg font-semibold text-cream">{svc.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-forest-200">{svc.description}</p>
                    <Link href={svc.href} className="mt-4 inline-block text-sm font-medium text-accent transition hover:text-accent-light">
                      Dowiedz się więcej →
                    </Link>
                  </div>
                </AnimatedItem>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Section 4: Wyróżnione produkty */}
      {featuredProducts.length > 0 && (
        <section className="bg-forest-900 py-20">
          <div className="mx-auto max-w-7xl px-4">
            <AnimatedSection>
              <h2 className="text-center text-3xl font-bold text-cream md:text-4xl">
                Nasze bestsellery
              </h2>
            </AnimatedSection>
            <div className="mt-12 flex gap-6 overflow-x-auto pb-4 snap-x">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/sklep/${product.slug}`}
                  className="group min-w-[280px] shrink-0 snap-start rounded-xl border border-forest-700 bg-forest-800 overflow-hidden transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-lg"
                >
                  {(() => {
                    const firstImg = product.images?.[0]?.image
                    const imgUrl = getMediaUrl(firstImg)
                    return imgUrl ? (
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={imgUrl}
                          alt={product.name}
                          fill
                          className="object-cover transition group-hover:scale-105"
                          sizes="280px"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] bg-gradient-to-br from-forest-700 to-forest-800 flex items-center justify-center text-4xl">
                        🍽️
                      </div>
                    )
                  })()}
                  <div className="p-5">
                    <h3 className="font-semibold text-cream">{product.name}</h3>
                    {product.shortDescription && (
                      <p className="mt-1 text-sm text-forest-300 line-clamp-2">{product.shortDescription}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-lg font-bold text-accent">{formatPrice(product.price)}</span>
                      {product.compareAtPrice && (
                        <span className="text-sm text-forest-400 line-through">{formatPrice(product.compareAtPrice)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/sklep" className="text-sm font-medium text-accent transition hover:text-accent-light">
                Zobacz cały sklep →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Section 5: O nas */}
      <section className="bg-forest-950 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <AnimatedSection>
              <span className="text-sm font-medium uppercase tracking-wider text-accent">O Forest Catering</span>
              <h2 className="mt-3 text-3xl font-bold text-cream md:text-4xl">
                Gotujemy z pasją od ponad 10 lat
              </h2>
              <p className="mt-6 leading-relaxed text-forest-200">
                Forest Catering to zespół doświadczonych kucharzy i pasjonatów dobrego jedzenia ze Szczecina.
                Specjalizujemy się w cateringu eventowym, firmowym i weselnym, zawsze stawiając na najwyższą
                jakość składników i indywidualne podejście do każdego klienta.
              </p>
              <p className="mt-4 leading-relaxed text-forest-200">
                Współpracujemy z lokalnymi dostawcami, korzystamy z sezonowych składników i przygotowujemy
                wszystko ręcznie — od pieczywa po desery. Każde zamówienie traktujemy jak wyzwanie, któremu
                chcemy sprostać na najwyższym poziomie.
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {['Świeże lokalne składniki', 'Ręczne przygotowanie', 'Indywidualne menu', 'Doświadczony zespół'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-forest-200">
                    <span className="text-accent">✓</span> {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/oferta"
                className="mt-8 inline-flex items-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-forest-950 transition hover:bg-accent-light"
              >
                Poznaj naszą ofertę
              </Link>
            </AnimatedSection>
          </div>
          <div className="lg:col-span-2">
            <AnimatedSection>
              <div className="flex h-full min-h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-forest-800">
                <img
                  src="https://images.unsplash.com/photo-1530062845289-9109b2c9c868?w=800&q=80"
                  alt="Forest Catering - przygotowanie posiłków"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Section 6: Galeria preview */}
      <section className="bg-forest-900 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <AnimatedSection>
            <h2 className="text-center text-3xl font-bold text-cream md:text-4xl">
              Nasze realizacje
            </h2>
          </AnimatedSection>
          <AnimatedSection stagger>
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
              {galleryPreviewImages.map((item, i) => (
                <AnimatedItem key={item.cat}>
                  <div className={`group relative overflow-hidden rounded-lg ${i < 2 ? 'row-span-2 aspect-[3/4]' : 'aspect-square'}`}>
                    <img
                      src={item.src}
                      alt={item.cat}
                      loading="lazy"
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-forest-950/40 opacity-0 transition group-hover:opacity-100">
                      <span className="rounded-full bg-forest-800/80 px-3 py-1 text-sm font-medium text-cream">{item.cat}</span>
                    </div>
                  </div>
                </AnimatedItem>
              ))}
            </div>
          </AnimatedSection>
          <div className="mt-8 text-center">
            <Link href="/galeria" className="text-sm font-medium text-accent transition hover:text-accent-light">
              Zobacz pełną galerię →
            </Link>
          </div>
        </div>
      </section>

      {/* Section 7: Opinie */}
      <section className="bg-forest-950 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <AnimatedSection>
            <h2 className="text-center text-3xl font-bold text-cream md:text-4xl">
              Co mówią nasi klienci
            </h2>
          </AnimatedSection>
          <AnimatedSection stagger>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <AnimatedItem key={t.author}>
                  <div className="relative rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10">
                    <span className="absolute top-4 left-4 text-6xl leading-none text-accent/20">&ldquo;</span>
                    <p className="relative z-10 mt-4 text-lg leading-relaxed italic text-cream">
                      {t.quote}
                    </p>
                    <div className="mt-6">
                      <p className="font-semibold text-cream">— {t.author}</p>
                      <p className="text-sm text-forest-300">{t.event}</p>
                      <div className="mt-2 text-accent">⭐⭐⭐⭐⭐</div>
                    </div>
                  </div>
                </AnimatedItem>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Section 8: Kontakt CTA */}
      <section className="border-t border-accent/20 border-b border-b-accent/20 bg-gradient-to-r from-forest-800 to-forest-900 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-cream md:text-4xl">
              Zamów catering już dziś
            </h2>
            <p className="mt-4 text-forest-200">
              Odpowiadamy w ciągu 24h. Bezpłatna wycena.
            </p>
            <a href="tel:+48123456789" className="mt-6 block text-2xl font-bold text-accent transition hover:text-accent-light md:text-3xl">
              +48 123 456 789
            </a>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/kontakt"
                className="inline-flex items-center rounded-lg bg-accent px-8 py-3.5 text-base font-semibold text-forest-950 transition hover:bg-accent-light"
              >
                Napisz do nas
              </Link>
              <a
                href="tel:+48123456789"
                className="inline-flex items-center rounded-lg border border-accent px-8 py-3.5 text-base font-semibold text-accent transition hover:bg-accent/10"
              >
                Zadzwoń
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
