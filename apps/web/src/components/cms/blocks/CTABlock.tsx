import Link from 'next/link'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import type { PageSection } from '../types'

type CTAProps = Extract<PageSection, { blockType: 'cta' }>

export function CTABlock({ heading, text, buttonText, buttonLink, variant }: CTAProps) {
  const isPrimary = variant !== 'secondary'

  return (
    <section className="border-t border-accent/20 bg-gradient-to-r from-forest-800 to-forest-900 py-20">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <AnimatedSection>
          <h2 className="text-3xl font-bold text-cream md:text-4xl">{heading}</h2>
          {text && <p className="mt-4 text-forest-200">{text}</p>}
          <div className="mt-8">
            <Link
              href={buttonLink}
              className={
                isPrimary
                  ? 'inline-flex items-center rounded-lg bg-accent px-8 py-3.5 text-base font-semibold text-forest-950 transition hover:bg-accent-light'
                  : 'inline-flex items-center rounded-lg border border-accent px-8 py-3.5 text-base font-semibold text-accent transition hover:bg-accent/10'
              }
            >
              {buttonText}
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
