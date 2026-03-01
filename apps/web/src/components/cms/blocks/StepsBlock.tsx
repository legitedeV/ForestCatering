import { AnimatedItem, AnimatedSection } from '@/components/ui/AnimatedSection'
import type { PageSection } from '../types'

type StepsProps = Extract<PageSection, { blockType: 'steps' }>

export function StepsBlock({ heading, steps }: StepsProps) {
  if (!steps?.length) return null

  return (
    <section className="bg-forest-950 py-14">
      <div className="mx-auto max-w-7xl px-4">
        {heading && (
          <AnimatedSection>
            <h2 className="text-center text-3xl font-bold text-cream md:text-4xl">{heading}</h2>
            <div className="mx-auto mt-2 h-1 w-16 rounded bg-accent" />
          </AnimatedSection>
        )}

        <AnimatedSection stagger>
          {/* Desktop: horizontal timeline */}
          <div className="mt-10 hidden lg:flex lg:gap-0">
            {steps.map((step, i) => (
              <AnimatedItem key={step.id ?? i}>
                <div className={`timeline-connector flex flex-1 flex-col items-center text-center px-4 ${i === steps.length - 1 ? 'last-child' : ''}`}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-warm text-sm font-bold text-forest-950">
                    {i + 1}
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-cream">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-forest-200 line-clamp-2">{step.description}</p>
                </div>
              </AnimatedItem>
            ))}
          </div>

          {/* Mobile: vertical layout */}
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
            {steps.map((step, i) => (
              <AnimatedItem key={step.id ?? i}>
                <article className="flex items-start gap-3 rounded-lg border border-forest-700 bg-forest-800 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-warm text-sm font-bold text-forest-950">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-cream">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-forest-200 line-clamp-2">{step.description}</p>
                  </div>
                </article>
              </AnimatedItem>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
