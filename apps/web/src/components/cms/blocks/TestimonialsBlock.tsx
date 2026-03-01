import { AnimatedSection } from '@/components/ui/AnimatedSection'
import type { PageSection } from '../types'
import { TestimonialsCarousel } from './TestimonialsCarousel'

type TestimonialsProps = Extract<PageSection, { blockType: 'testimonials' }>

export function TestimonialsBlock({ heading, items }: TestimonialsProps) {
  if (!items || items.length === 0) return null

  const carouselItems = items.map((t, i) => ({
    id: t.id ?? String(i),
    quote: t.quote,
    author: t.author,
    event: t.event ?? undefined,
    rating: t.rating ?? undefined,
  }))

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
        <TestimonialsCarousel items={carouselItems} />
      </div>
    </section>
  )
}
