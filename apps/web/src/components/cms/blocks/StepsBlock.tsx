import { AnimatedItem, AnimatedSection } from '@/components/ui/AnimatedSection'
import type { PageSection } from '../types'

type StepsProps = Extract<PageSection, { blockType: 'steps' }>

export function StepsBlock({ heading, steps }: StepsProps) {
  if (!steps?.length) return null

  return (
    <section className="bg-forest-950 py-20">
      <div className="mx-auto max-w-7xl px-4">
        {heading && (
          <AnimatedSection>
            <h2 className="text-center text-3xl font-bold text-cream md:text-4xl">{heading}</h2>
            <div className="mx-auto mt-2 h-1 w-16 rounded bg-accent" />
          </AnimatedSection>
        )}

        <AnimatedSection stagger>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <AnimatedItem key={step.id ?? i}>
                <article className="rounded-xl border border-forest-700 bg-forest-800 p-6">
                  <p className="text-4xl">{step.emoji}</p>
                  <h3 className="mt-4 text-xl font-semibold text-cream">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-forest-200">{step.description}</p>
                </article>
              </AnimatedItem>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
