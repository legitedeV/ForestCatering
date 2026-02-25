import type { PageSection } from '../types'
import { AnimatedSection } from '@/components/ui/AnimatedSection'

type MapAreaProps = Extract<PageSection, { blockType: 'mapArea' }>

export function MapAreaBlock({ heading, description, embedUrl, cities, note }: MapAreaProps) {
  if (!embedUrl) return null

  return (
    <section className="bg-forest-900 py-20">
      <div className="mx-auto max-w-7xl px-4">
        {(heading || description) && (
          <AnimatedSection>
            {heading && <h2 className="text-center text-3xl font-bold text-cream md:text-5xl">{heading}</h2>}
            {description && <p className="mx-auto mt-4 max-w-3xl whitespace-pre-line text-center text-forest-200">{description}</p>}
          </AnimatedSection>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-forest-700 bg-forest-800">
            <iframe
              src={embedUrl}
              title={heading || 'Mapa obszaru działania'}
              className="h-[420px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="rounded-2xl border border-forest-700 bg-forest-800 p-6">
            {cities?.length ? (
              <>
                <h3 className="text-lg font-semibold text-cream">Obsługiwane miasta</h3>
                <ul className="mt-4 space-y-2">
                  {cities.map((city, index) => (
                    <li key={city.id ?? index} className="text-sm text-forest-200">• {city.name}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-forest-200">Działamy na terenie całego regionu — skontaktuj się, aby potwierdzić dojazd.</p>
            )}
            {note && <p className="mt-6 text-sm text-forest-300">{note}</p>}
          </div>
        </div>
      </div>
    </section>
  )
}
