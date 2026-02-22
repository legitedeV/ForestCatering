import { AnimatedSection, AnimatedItem } from '@/components/ui/AnimatedSection'
import type { PageSection } from '../types'

type TestimonialsProps = Extract<PageSection, { blockType: 'testimonials' }>

export function TestimonialsBlock({ heading, items }: TestimonialsProps) {
  if (!items || items.length === 0) return null

  return (
    <section className="bg-forest-950 py-20">
      <div className="mx-auto max-w-7xl px-4">
        {heading && (
          <AnimatedSection>
            <h2 className="text-center text-3xl font-bold text-cream md:text-4xl">
              {heading}
            </h2>
          </AnimatedSection>
        )}
        <AnimatedSection stagger>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {items.map((t, i) => (
              <AnimatedItem key={t.id ?? i}>
                <div className="relative rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10">
                  <span className="absolute top-4 left-4 text-6xl leading-none text-accent/20">&ldquo;</span>
                  <p className="relative z-10 mt-4 text-lg leading-relaxed italic text-cream">
                    {t.quote}
                  </p>
                  <div className="mt-6">
                    <p className="font-semibold text-cream">— {t.author}</p>
                    {t.event && <p className="text-sm text-forest-300">{t.event}</p>}
                    {t.rating && t.rating > 0 && (
                      <div className="mt-2 text-accent">
                        {'⭐'.repeat(t.rating)}
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedItem>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
