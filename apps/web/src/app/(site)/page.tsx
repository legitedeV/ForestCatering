import Link from 'next/link'

const services = [
  {
    emoji: '🏢',
    title: 'Catering firmowy',
    description: 'Profesjonalna obsługa spotkań biznesowych i konferencji.',
  },
  {
    emoji: '🎉',
    title: 'Eventy',
    description: 'Kompleksowa obsługa eventów prywatnych i firmowych.',
  },
  {
    emoji: '💍',
    title: 'Wesela',
    description: 'Wyjątkowe menu weselne dopasowane do Waszych potrzeb.',
  },
  {
    emoji: '🍸',
    title: 'Bar',
    description: 'Mobilny bar z profesjonalną obsługą barmańską.',
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-forest-900 via-forest-700 to-forest-800 py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
            Profesjonalny catering w Szczecinie
          </h1>
          <p className="mt-6 text-lg text-forest-200 md:text-xl">
            Tworzymy wyjątkowe doświadczenia kulinarne dla firm, eventów i uroczystości
            prywatnych. Świeże składniki, autorskie receptury, nienaganna obsługa.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/sklep"
              className="inline-flex items-center rounded-lg bg-accent px-8 py-3 text-base font-semibold text-forest-900 transition hover:bg-accent/90"
            >
              Zobacz menu
            </Link>
            <Link
              href="/kontakt"
              className="inline-flex items-center rounded-lg border-2 border-white/30 px-8 py-3 text-base font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              Skontaktuj się
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-3xl font-bold text-forest-800">Nasze usługi</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((svc) => (
              <div
                key={svc.title}
                className="rounded-xl border border-forest-100 bg-white p-6 text-center shadow-sm transition hover:shadow-md"
              >
                <span className="text-4xl">{svc.emoji}</span>
                <h3 className="mt-4 text-lg font-semibold text-forest-700">{svc.title}</h3>
                <p className="mt-2 text-sm text-forest-600/80">{svc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
