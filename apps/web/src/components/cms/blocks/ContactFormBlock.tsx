import { Suspense } from 'react'
import { ContactContent } from '@/components/contact/ContactContent'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import type { PageSection } from '../types'

type ContactFormProps = Extract<PageSection, { blockType: 'contactForm' }>

export function ContactFormBlock({ heading, subheading }: ContactFormProps) {
  return (
    <section className="bg-forest-900 py-20">
      <div className="mx-auto max-w-7xl px-4">
        {(heading || subheading) && (
          <AnimatedSection>
            {heading && <h2 className="text-3xl font-bold text-cream md:text-5xl">{heading}</h2>}
            {subheading && <p className="mt-4 text-lg text-forest-200">{subheading}</p>}
          </AnimatedSection>
        )}

        <Suspense fallback={<div className="mt-12 text-center text-forest-300">Ładowanie...</div>}>
          <ContactContent />
        </Suspense>
      </div>
    </section>
  )
}
