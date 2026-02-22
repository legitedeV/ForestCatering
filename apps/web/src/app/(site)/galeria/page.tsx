'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
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

const galleryItems = [
  { id: '1', alt: 'Eleganckie wesele w plenerze', category: 'wesela', src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80' },
  { id: '2', alt: 'Bankiet firmowy', category: 'eventy-firmowe', src: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80' },
  { id: '3', alt: 'Stół degustacyjny', category: 'catering-prywatny', src: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80' },
  { id: '4', alt: 'Koktajl bar premium', category: 'bar', src: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80' },
  { id: '5', alt: 'Dekoracje kwiatowe na stole', category: 'dekoracje', src: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80' },
  { id: '6', alt: 'Catering weselny - przystawki', category: 'wesela', src: 'https://images.unsplash.com/photo-1530062845289-9109b2c9c868?w=800&q=80' },
  { id: '7', alt: 'Outdoor event setup', category: 'eventy-firmowe', src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80' },
  { id: '8', alt: 'Elegancki stół bankietowy', category: 'catering-prywatny', src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80' },
  { id: '9', alt: 'Barman serwujący drinki', category: 'bar', src: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
  { id: '10', alt: 'Wesele w ogrodzie', category: 'wesela', src: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80' },
  { id: '11', alt: 'Konferencja z cateringiem', category: 'eventy-firmowe', src: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80' },
  { id: '12', alt: 'Dekoracje na evencie', category: 'dekoracje', src: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&q=80' },
]

export default function GaleriaPage() {
  const [activeCategory, setActiveCategory] = useState('')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filtered = activeCategory
    ? galleryItems.filter((item) => item.category === activeCategory)
    : galleryItems

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
              <Image
                src={item.src}
                alt={item.alt}
                width={800}
                height={i % 3 === 0 ? 1067 : 800}
                loading="lazy"
                unoptimized
                className={`w-full object-cover transition group-hover:scale-105 ${
                  i % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'
                }`}
              />
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
              <Image
                src={filtered[lightboxIndex].src}
                alt={filtered[lightboxIndex].alt}
                width={1200}
                height={800}
                unoptimized
                className="max-h-[75vh] max-w-[85vw] rounded-xl object-contain"
              />
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
