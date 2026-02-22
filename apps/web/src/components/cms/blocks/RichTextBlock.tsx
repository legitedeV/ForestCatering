import { RichText } from '@payloadcms/richtext-lexical/react'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import type { PageSection } from '../types'

type RichTextProps = Extract<PageSection, { blockType: 'richText' }>

export function RichTextBlock({ content }: RichTextProps) {
  return (
    <section className="bg-forest-950 py-16">
      <div className="mx-auto max-w-3xl px-4">
        <AnimatedSection>
          <div className="prose prose-invert prose-lg max-w-none prose-headings:text-cream prose-p:text-forest-100 prose-a:text-accent prose-strong:text-cream">
            <RichText data={content as never} />
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
