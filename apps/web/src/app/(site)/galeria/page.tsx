'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AnimatedSection } from '@/components/ui/AnimatedSection'

const categoryMap: Record<string, string> = {
  '': 'Wszystkie',
  wesela: 'Wesela',
  'eventy-firmowe': 'Eventy firmowe',
  'catering-prywatny': 'Catering prywatny',
  bar: 'Bar',
  dekoracje: 'Dekoracje',
}

const placeholderItems = [
  { id: '1', alt: 'Eleganckie wesele w plenerze', category: 'wesela', emoji: '💒' },
  { id: '2', alt: 'Konferencja firmowa', category: 'eventy-firmowe', emoji: '🏢' },
  { id: '3', alt: 'Menu degustacyjne', category: 'catering-prywatny', emoji: '🍽️' },
  { id: '4', alt: 'Koktajl bar premium', category: 'bar', emoji: '🍸' },
  { id: '5', alt: 'Dekoracje kwiatowe', category: 'dekoracje', emoji: '🌸' },
  { id: '6', alt: 'Catering weselny', category: 'wesela', emoji: '💍' },
  { id: '7', alt: 'Event firmowy outdoor', category: 'eventy-firmowe', emoji: '🎪' },
  { id: '8', alt: 'Stół bankietowy', category: 'catering-prywatny', emoji: '🎂' },
  { id: '9', alt: 'Drink bar', category: 'bar', emoji: '🥂' },
]

export default function GaleriaPage() {
  const [activeCategory, setActiveCategory] = useState('')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filtered = activeCategory
    ? placeholderItems.filter((item) => item.category === activeCategory)
    : placeholderItems

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev !== null && prev < filtered.length - 1 ? prev + 1 : prev))
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))
    },
    [lightboxIndex, filtered.length],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="min-h-screen bg-forest-900 pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4">
        <AnimatedSection>
          <h1 className="text-center text-3xl font-bold text-cream md:text-5xl">Galeria realizacji</h1>
          <div className="mx-auto mt-2 h-1 w-16 rounded bg-accent" />
        </AnimatedSection>

        {/* Category tabs */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {Object.entries(categoryMap).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setActiveCategory(value)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                activeCategory === value
                  ? 'border-accent bg-accent text-forest-950'
                  : 'border-forest-700 bg-forest-800 text-forest-200 hover:border-accent/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Masonry grid */}
        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {filtered.map((item, i) => (
            <div
              key={item.id}
              className="group relative mb-4 cursor-pointer overflow-hidden rounded-lg break-inside-avoid"
              onClick={() => setLightboxIndex(i)}
            >
              <div className={`flex items-center justify-center bg-gradient-to-br from-forest-700 to-forest-800 text-4xl transition group-hover:scale-105 ${i % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'}`}>
                {item.emoji}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-forest-950/60 opacity-0 transition group-hover:opacity-100">
                <span className="text-sm font-medium text-cream">{item.alt}</span>
                <span className="mt-2 rounded-full bg-accent/20 px-3 py-1 text-xs text-accent">
                  {categoryMap[item.category]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-forest-950/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
          >
            <motion.div
              className="relative flex max-h-[80vh] max-w-[90vw] flex-col items-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex aspect-[4/3] w-full max-w-2xl items-center justify-center rounded-xl bg-gradient-to-br from-forest-700 to-forest-800 text-8xl">
                {filtered[lightboxIndex].emoji}
              </div>
              <p className="mt-4 text-center text-cream">{filtered[lightboxIndex].alt}</p>

              {/* Navigation */}
              {lightboxIndex > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1) }}
                  className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-forest-800/80 p-3 text-cream transition hover:text-accent"
                >
                  ←
                </button>
              )}
              {lightboxIndex < filtered.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1) }}
                  className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-forest-800/80 p-3 text-cream transition hover:text-accent"
                >
                  →
                </button>
              )}

              {/* Close */}
              <button
                onClick={() => setLightboxIndex(null)}
                className="absolute -top-2 -right-2 rounded-full bg-forest-800 p-2 text-cream transition hover:text-accent"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
