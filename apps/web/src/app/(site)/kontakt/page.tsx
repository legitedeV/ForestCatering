import { Suspense } from 'react'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { ContactContent } from '@/components/contact/ContactContent'

export default function KontaktPage() {
  return (
    <div className="min-h-screen bg-forest-900 pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4">
        <AnimatedSection>
          <h1 className="text-3xl font-bold text-cream md:text-5xl">Kontakt</h1>
          <div className="mt-2 h-1 w-16 rounded bg-accent" />
          <p className="mt-4 text-lg text-forest-200">Napisz do nas — odpowiemy w ciągu 24h</p>
        </AnimatedSection>

        <Suspense fallback={<div className="mt-12 text-center text-forest-300">Ładowanie...</div>}>
          <ContactContent />
        </Suspense>
      </div>
    </div>
  )
}
