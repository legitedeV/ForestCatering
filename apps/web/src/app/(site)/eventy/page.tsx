import Link from 'next/link'
import { AnimatedSection, AnimatedItem } from '@/components/ui/AnimatedSection'

const packages = [
  {
    tier: 'BASIC',
    name: 'Catering eventowy',
    price: 'od 85 zł/os.',
    features: ['Catering na 20-200 osób', 'Menu do wyboru', 'Dostawa i serwis', 'Naczynia i sztućce', 'Obsługa kelnerska', 'Serwetki i dekoracja stołów'],
    cta: '/kontakt?event=event-prywatny',
    featured: false,
  },
  {
    tier: 'PREMIUM',
    name: 'Catering premium',
    price: 'od 120 zł/os.',
    features: ['Catering na 20-500 osób', 'Menu degustacyjne', 'Serwis kelnerski premium', 'Dekoracje stołów', 'Obsługa na miejscu', 'Sprzęt cateringowy w cenie'],
    cta: '/kontakt?event=event-prywatny',
    featured: true,
  },
  {
    tier: 'CATERING + BAR',
    name: 'Pakiet kompletny',
    price: 'od 160 zł/os.',
    features: ['Wszystko z Premium', 'Profesjonalni barmani', 'Drink bar premium', 'Koktajle autorskie', 'Pokazy barmańskie', 'Sprzęt barowy w cenie'],
    cta: '/kontakt?event=catering-plus-bar',
    featured: false,
  },
]

const steps = [
  { emoji: '📞', title: 'Kontakt', description: 'Opowiedz nam o swoim evencie' },
  { emoji: '📋', title: 'Planowanie', description: 'Dobierzemy idealne menu' },
  { emoji: '🍽️', title: 'Realizacja', description: 'Zajmiemy się wszystkim' },
  { emoji: '🎉', title: 'Sukces', description: 'Twoi goście będą zachwyceni' },
]

export default function EventyPage() {
  return (
    <div className="min-h-screen bg-forest-900 pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4">
        <AnimatedSection>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-cream md:text-5xl">
              Eventy na najwyższym poziomie
            </h1>
            <div className="mx-auto mt-2 h-1 w-16 rounded bg-accent" />
          </div>
        </AnimatedSection>

        {/* Packages */}
        <AnimatedSection stagger>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {packages.map((pkg) => (
              <AnimatedItem key={pkg.tier}>
                <div className={`relative flex h-full flex-col rounded-xl border ${pkg.featured ? 'border-accent' : 'border-forest-700'} bg-forest-800 p-8 transition hover:-translate-y-1 hover:shadow-lg`}>
                  {pkg.featured && (
                    <span className="absolute -top-3 right-6 rounded-full bg-accent px-4 py-1 text-xs font-bold text-forest-950">
                      Najpopularniejszy
                    </span>
                  )}
                  <span className="mb-2 inline-block w-fit rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                    {pkg.tier}
                  </span>
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

        {/* How it works */}
        <section className="mt-24">
          <AnimatedSection>
            <h2 className="text-center text-2xl font-bold text-cream md:text-3xl">
              Jak to działa?
            </h2>
          </AnimatedSection>
          <AnimatedSection stagger>
            <div className="mt-12 grid gap-8 md:grid-cols-4">
              {steps.map((step, i) => (
                <AnimatedItem key={step.title}>
                  <div className="relative text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl">
                      {step.emoji}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-cream">{step.title}</h3>
                    <p className="mt-2 text-sm text-forest-200">{step.description}</p>
                    {i < steps.length - 1 && (
                      <div className="absolute top-8 left-[calc(50%+40px)] hidden h-px w-[calc(100%-80px)] border-t border-dashed border-forest-600 md:block" />
                    )}
                  </div>
                </AnimatedItem>
              ))}
            </div>
          </AnimatedSection>
        </section>
      </div>
    </div>
  )
}
