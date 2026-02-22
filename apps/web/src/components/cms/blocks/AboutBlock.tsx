import Link from 'next/link'
import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { getMediaUrl } from '@/lib/media'
import type { PageSection } from '../types'

type AboutProps = Extract<PageSection, { blockType: 'about' }>

export function AboutBlock({ badge, heading, content, highlights, image, ctaText, ctaLink }: AboutProps) {
  const imgUrl = getMediaUrl(image)

  return (
    <section className="bg-forest-950 py-20">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <AnimatedSection>
            {badge && (
              <span className="text-sm font-medium uppercase tracking-wider text-accent">{badge}</span>
            )}
            <h2 className="mt-3 text-3xl font-bold text-cream md:text-4xl">
              {heading}
            </h2>
            {content && (
              <div className="mt-6 leading-relaxed text-forest-200 prose prose-invert max-w-none prose-p:text-forest-200">
                <RichText data={content as never} />
              </div>
            )}
            {highlights && highlights.length > 0 && (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {highlights.map((item, i) => (
                  <li key={item.id ?? i} className="flex items-center gap-2 text-forest-200">
                    <span className="text-accent">✓</span> {item.text}
                  </li>
                ))}
              </ul>
            )}
            {ctaText && ctaLink && (
              <Link
                href={ctaLink}
                className="mt-8 inline-flex items-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-forest-950 transition hover:bg-accent-light"
              >
                {ctaText}
              </Link>
            )}
          </AnimatedSection>
        </div>
        <div className="lg:col-span-2">
          <AnimatedSection>
            <div className="relative flex h-full min-h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-forest-800">
              {imgUrl && (
                <Image
                  src={imgUrl}
                  alt={heading}
                  fill
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
