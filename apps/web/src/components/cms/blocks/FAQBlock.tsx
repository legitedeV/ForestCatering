import { AnimatedSection } from '@/components/ui/AnimatedSection'
import type { PageSection } from '../types'

type FAQProps = Extract<PageSection, { blockType: 'faq' }>

export function FAQBlock({ items }: FAQProps) {
  if (!items || items.length === 0) return null

  return (
    <section className="bg-forest-950 py-16">
      <div className="mx-auto max-w-3xl px-4">
        <AnimatedSection>
          <div className="space-y-6">
            {items.map((item, i) => (
              <details
                key={item.id ?? i}
                className="group rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
              >
                <summary className="cursor-pointer text-lg font-semibold text-cream transition group-open:text-accent">
                  {item.question}
                </summary>
                <p className="mt-3 leading-relaxed text-forest-200">{item.answer}</p>
              </details>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
