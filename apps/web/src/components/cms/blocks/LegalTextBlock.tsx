import { RichText } from '@payloadcms/richtext-lexical/react'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import type { PageSection } from '../types'

type LegalTextProps = Extract<PageSection, { blockType: 'legalText' }>

export function LegalTextBlock({ heading, effectiveDate, content }: LegalTextProps) {
  return (
    <section className="bg-forest-900 py-20">
      <div className="mx-auto max-w-4xl px-4">
        {(heading || effectiveDate) && (
          <AnimatedSection>
            {heading && <h2 className="text-3xl font-bold text-cream md:text-4xl">{heading}</h2>}
            {effectiveDate && <p className="mt-2 text-sm text-forest-400">Obowiązuje od: {new Date(effectiveDate).toLocaleDateString('pl-PL')}</p>}
            <div className="mt-2 h-1 w-16 rounded bg-accent" />
          </AnimatedSection>
        )}

        <AnimatedSection>
          <div className="prose prose-invert prose-lg mt-10 max-w-none prose-headings:text-cream prose-p:text-forest-100 prose-a:text-accent prose-strong:text-cream">
            <RichText data={content as never} />
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
