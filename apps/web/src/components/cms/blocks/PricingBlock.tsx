import Link from 'next/link'
import { AnimatedItem, AnimatedSection } from '@/components/ui/AnimatedSection'
import type { PageSection } from '../types'

type PricingProps = Extract<PageSection, { blockType: 'pricing' }>

export function PricingBlock({ heading, subheading, packages }: PricingProps) {
  if (!packages?.length) return null

  return (
    <section className="bg-forest-900 py-20">
      <div className="mx-auto max-w-7xl px-4">
        {(heading || subheading) && (
          <AnimatedSection>
            {heading && <h2 className="text-center text-3xl font-bold text-cream md:text-5xl">{heading}</h2>}
            {subheading && <p className="mx-auto mt-4 max-w-2xl text-center text-forest-200">{subheading}</p>}
          </AnimatedSection>
        )}

        <AnimatedSection stagger>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {packages.map((pkg, i) => (
              <AnimatedItem key={pkg.id ?? i}>
                <div className={`glass-card relative flex h-full flex-col p-8 ${pkg.featured ? 'scale-105 border-accent-warm' : ''}`}>
                  {pkg.featured && (
                    <span className="absolute -top-3 right-6 rounded-full bg-accent-warm px-4 py-1 text-xs font-bold text-forest-950">
                      Najpopularniejszy
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-cream">{pkg.name}</h3>
                  <p className="mt-2 text-2xl font-bold text-accent-warm">{pkg.price}</p>
                  <ul className="mt-6 flex-1 space-y-3">
                    {pkg.features?.map((feature, featureIndex) => (
                      <li key={feature.id ?? featureIndex} className="flex items-center gap-2 text-sm text-forest-200">
                        <span className="text-accent-warm">✓</span> {feature.text}
                      </li>
                    ))}
                  </ul>
                  {pkg.ctaLink && pkg.ctaText && (
                    <Link
                      href={pkg.ctaLink}
                      className={`mt-8 block rounded-lg py-3 text-center text-sm font-semibold transition ${pkg.featured ? 'bg-accent-warm text-forest-950 hover:bg-accent-warm-light' : 'border border-accent-warm text-accent-warm hover:bg-accent-warm/10'}`}
                    >
                      {pkg.ctaText}
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
