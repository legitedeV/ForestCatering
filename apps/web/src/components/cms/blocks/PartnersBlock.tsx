import Link from 'next/link'
import Image from 'next/image'
import type { PageSection } from '../types'
import { AnimatedItem, AnimatedSection } from '@/components/ui/AnimatedSection'
import { getMediaUrl } from '@/lib/media'

type PartnersProps = Extract<PageSection, { blockType: 'partners' }>

export function PartnersBlock({ heading, items, grayscale }: PartnersProps) {
  if (!items?.length) return null

  return (
    <section className="bg-forest-900 py-20">
      <div className="mx-auto max-w-7xl px-4">
        {heading && (
          <AnimatedSection>
            <h2 className="text-center text-3xl font-bold text-cream md:text-5xl">{heading}</h2>
          </AnimatedSection>
        )}

        <AnimatedSection stagger>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, index) => {
              const logoUrl = getMediaUrl(item.logo)
              if (!logoUrl) return null

              const content = (
                <div className="flex h-32 items-center justify-center rounded-xl border border-forest-700 bg-forest-800 p-6 transition hover:border-accent/40">
                  <Image
                    src={logoUrl}
                    alt={item.name}
                    width={180}
                    height={70}
                    className={`h-auto max-h-16 w-auto object-contain ${grayscale ? 'grayscale' : ''}`}
                  />
                </div>
              )

              return (
                <AnimatedItem key={item.id ?? index}>
                  {item.url ? (
                    <Link href={item.url} target="_blank" rel="noopener noreferrer" aria-label={item.name}>
                      {content}
                    </Link>
                  ) : content}
                </AnimatedItem>
              )
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
