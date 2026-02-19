import Link from 'next/link'
import { AnimatedSection, AnimatedItem } from '@/components/ui/AnimatedSection'

const packages = [
  {
    name: 'Catering firmowy',
    price: 'od 45 zł/os.',
    features: ['Śniadania i lunche', 'Menu sezonowe', 'Dostawa do biura', 'Stałe zamówienia', 'Diety specjalne', 'Faktura VAT'],
    cta: '/kontakt?event=catering-firmowy',
    featured: false,
  },
  {
    name: 'Catering eventowy',
    price: 'od 85 zł/os.',
    features: ['Catering na 20-500 osób', 'Serwis kelnerski', 'Dekoracje stołów', 'Menu degustacyjne', 'Obsługa na miejscu', 'Sprzęt cateringowy'],
    cta: '/kontakt?event=event-prywatny',
    featured: false,
  },
  {
    name: 'Catering + Bar',
    price: 'od 120 zł/os.',
    features: ['Wszystko z Premium', 'Profesjonalni barmani', 'Drink bar', 'Koktajle autorskie', 'Pokazy barmańskie', 'Sprzęt barowy'],
    cta: '/kontakt?event=catering-plus-bar',
    featured: true,
  },
]

export default function OfertaPage() {
  return (
    <div className="min-h-screen bg-forest-900 pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4">
        <AnimatedSection>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-cream md:text-5xl">Nasza oferta</h1>
            <div className="mx-auto mt-2 h-1 w-16 rounded bg-accent" />
            <p className="mt-4 text-lg text-forest-200">Dopasujemy catering do Twoich potrzeb</p>
          </div>
        </AnimatedSection>

        <AnimatedSection stagger>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {packages.map((pkg) => (
              <AnimatedItem key={pkg.name}>
                <div className={`relative flex h-full flex-col rounded-xl border ${pkg.featured ? 'border-accent' : 'border-forest-700'} bg-forest-800 p-8 transition hover:-translate-y-1 hover:shadow-lg`}>
                  {pkg.featured && (
                    <span className="absolute -top-3 right-6 rounded-full bg-accent px-4 py-1 text-xs font-bold text-forest-950">
                      Najpopularniejszy
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-cream">{pkg.name}</h3>
                  <p className="mt-2 text-2xl font-bold text-accent">{pkg.price}</p>
                  <ul className="mt-6 flex-1 space-y-3">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-forest-200">
                        <span className="text-accent">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={pkg.cta}
                    className={`mt-8 block rounded-lg py-3 text-center text-sm font-semibold transition ${
                      pkg.featured
                        ? 'bg-accent text-forest-950 hover:bg-accent-light'
                        : 'border border-accent text-accent hover:bg-accent/10'
                    }`}
                  >
                    Zapytaj o wycenę
                  </Link>
                </div>
              </AnimatedItem>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
