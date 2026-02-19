import Link from 'next/link'
import { AnimatedSection } from '@/components/ui/AnimatedSection'

export default function KoszykPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-900 px-4 pt-24 pb-20">
      <AnimatedSection>
        <div className="text-center">
          <span className="text-6xl text-forest-400">🛒</span>
          <h1 className="mt-6 text-3xl font-bold text-cream">Twój koszyk</h1>
          <p className="mt-4 text-forest-300">
            Funkcja koszyka będzie dostępna wkrótce.
          </p>
          <Link
            href="/sklep"
            className="mt-8 inline-flex items-center rounded-lg bg-accent px-8 py-3 text-base font-semibold text-forest-950 transition hover:bg-accent-light"
          >
            Przejdź do sklepu
          </Link>
        </div>
      </AnimatedSection>
    </div>
  )
}
