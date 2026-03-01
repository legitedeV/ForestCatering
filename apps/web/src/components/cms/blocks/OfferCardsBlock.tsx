import Link from 'next/link'
import type { PageSection } from '../types'
import { AnimatedItem, AnimatedSection } from '@/components/ui/AnimatedSection'

type OfferCardsProps = Extract<PageSection, { blockType: 'offerCards' }>

export function OfferCardsBlock({ heading, cards }: OfferCardsProps) {
  if (!cards?.length) return null

  return (
    <section className="bg-orbs bg-forest-950 py-20">
      <div className="mx-auto max-w-7xl px-4">
        {heading && (
          <AnimatedSection>
            <h2 className="text-center text-3xl font-bold text-cream md:text-5xl">{heading}</h2>
          </AnimatedSection>
        )}

        <AnimatedSection stagger>
          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card, index) => (
              <AnimatedItem key={card.id ?? index}>
                <article className={`glass-card warm-glow relative flex h-full flex-col p-8 transition hover:scale-[1.02] ${card.featured ? 'border-accent-warm' : ''}`}>
                  {card.badge && <span className="absolute -top-3 right-6 rounded-full bg-accent-warm px-4 py-1 text-xs font-bold text-forest-950">{card.badge}</span>}
                  <h3 className="text-2xl font-semibold text-cream">{card.title}</h3>
                  {card.priceFrom && <p className="mt-2 text-lg font-medium text-accent-warm">Od {card.priceFrom}</p>}

                  <ul className="mt-5 flex-1 space-y-2">
                    {card.features?.map((feature, featureIndex) => (
                      <li key={feature.id ?? featureIndex} className="text-sm text-forest-200"><span className="text-accent-warm">✓</span> {feature.text}</li>
                    ))}
                  </ul>

                  {card.ctaText && card.ctaLink && (
                    <Link
                      href={card.ctaLink}
                      className={`mt-8 inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition ${card.featured ? 'bg-accent-warm text-forest-950 hover:bg-accent-warm-light' : 'border border-accent-warm text-accent-warm hover:bg-accent-warm/10'}`}
                    >
                      {card.ctaText}
                    </Link>
                  )}
                </article>
              </AnimatedItem>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
