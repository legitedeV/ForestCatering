import Link from 'next/link'
import Image from 'next/image'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { getMediaUrl } from '@/lib/media'
import type { PageSection } from '../types'

type HeroProps = Extract<PageSection, { blockType: 'hero' }>

export function HeroBlock({ heading, subheading, backgroundImage, ctaText, ctaLink, badge, secondaryCtaText, secondaryCtaLink, showScrollIndicator, fullHeight }: HeroProps) {
  const bgUrl = getMediaUrl(backgroundImage)

  return (
    <section className={`relative flex items-center justify-center bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 ${fullHeight ? 'min-h-screen' : 'min-h-[60vh]'}`}>
      {bgUrl && (
        <Image
          src={bgUrl}
          alt=""
          fill
          className="object-cover opacity-30"
          priority
        />
      )}
      <div className="relative mx-auto max-w-5xl px-4 text-center">
        {badge && (
          <AnimatedSection>
            <span className="mb-6 inline-block rounded-full border border-accent/30 bg-forest-700/50 px-4 py-1.5 text-sm text-accent">
              {badge}
            </span>
          </AnimatedSection>
        )}
        <AnimatedSection>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-cream sm:text-5xl md:text-7xl">
            {heading}
          </h1>
        </AnimatedSection>
        {subheading && (
          <AnimatedSection>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-forest-200 md:text-xl">
              {subheading}
            </p>
          </AnimatedSection>
        )}
        {(ctaText && ctaLink) || (secondaryCtaText && secondaryCtaLink) ? (
          <AnimatedSection>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {ctaText && ctaLink && (
                <Link
                  href={ctaLink}
                  className="inline-flex items-center rounded-lg bg-accent px-8 py-3.5 text-base font-semibold text-forest-950 transition hover:scale-105 hover:bg-accent-light"
                >
                  {ctaText}
                </Link>
              )}
              {secondaryCtaText && secondaryCtaLink && (
                <Link
                  href={secondaryCtaLink}
                  className="inline-flex items-center rounded-lg border border-cream px-8 py-3.5 text-base font-semibold text-cream transition hover:bg-cream/10"
                >
                  {secondaryCtaText}
                </Link>
              )}
            </div>
          </AnimatedSection>
        ) : null}
      </div>
      {showScrollIndicator && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-cream/50">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      )}
    </section>
  )
}
