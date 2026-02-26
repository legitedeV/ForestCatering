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
          <div className="mt-10 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <AnimatedItem key={step.id ?? i}>
                <article className="rounded-lg border border-forest-700 bg-forest-800 p-3">
                  <p className="text-2xl">{step.emoji}</p>
                  <h3 className="mt-3 text-base font-semibold text-cream">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-forest-200 line-clamp-2">{step.description}</p>
                </article>
              </AnimatedItem>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
