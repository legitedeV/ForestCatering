import Link from 'next/link'
import Image from 'next/image'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { getMediaUrl } from '@/lib/media'
import type { PageSection } from '../types'

type HeroProps = Extract<PageSection, { blockType: 'hero' }>

export function HeroBlock({ heading, subheading, backgroundImage, ctaText, ctaLink }: HeroProps) {
  const bgUrl = getMediaUrl(backgroundImage)

  return (
    <section className="relative flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800">
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
        {ctaText && ctaLink && (
          <AnimatedSection>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href={ctaLink}
                className="inline-flex items-center rounded-lg bg-accent px-8 py-3.5 text-base font-semibold text-forest-950 transition hover:scale-105 hover:bg-accent-light"
              >
                {ctaText}
              </Link>
            </div>
          </AnimatedSection>
        )}
      </div>
    </section>
  )
}
