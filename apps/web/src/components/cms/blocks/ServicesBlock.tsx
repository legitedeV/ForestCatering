import Link from 'next/link'
import { AnimatedSection, AnimatedItem } from '@/components/ui/AnimatedSection'
import type { PageSection } from '../types'

type ServicesProps = Extract<PageSection, { blockType: 'services' }>

export function ServicesBlock({ heading, items }: ServicesProps) {
  if (!items || items.length === 0) return null

  return (
    <section className="bg-orbs bg-forest-950 py-20">
      <div className="mx-auto max-w-7xl px-4">
        {heading && (
          <AnimatedSection>
            <h2 className="text-center text-3xl font-bold text-cream md:text-4xl">
              {heading}
            </h2>
            <div className="mx-auto mt-2 h-1 w-16 rounded bg-accent" />
          </AnimatedSection>
        )}
        <AnimatedSection stagger>
          <div className={`mt-12 ${items.length === 3 ? 'bento-grid' : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-4'}`}>
            {items.map((svc, i) => (
              <AnimatedItem key={svc.id ?? i}>
                <div className="warm-glow group rounded-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl transition hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-accent/10">
                  <span className="text-5xl">{svc.emoji}</span>
                  <h3 className="mt-4 text-lg font-semibold text-cream">{svc.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-forest-200">{svc.description}</p>
                  {svc.link && (
                    <Link href={svc.link} className="mt-4 inline-block text-sm font-medium text-accent transition hover:text-accent-light">
                      Dowiedz się więcej →
                    </Link>
                  )}
                </div>
              </AnimatedItem>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
