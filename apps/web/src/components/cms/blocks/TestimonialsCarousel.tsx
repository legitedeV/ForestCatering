'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CarouselItem {
  id: string
  quote: string
  author: string
  event?: string
  rating?: number
}

interface TestimonialsCarouselProps {
  items: CarouselItem[]
}

export function TestimonialsCarousel({ items }: TestimonialsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const advance = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % items.length)
  }, [items.length])

  useEffect(() => {
    const timer = setInterval(advance, 5000)
    return () => clearInterval(timer)
  }, [advance])

  const item = items[activeIndex]

  return (
    <div className="relative mt-12">
      <span className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 text-8xl leading-none text-accent-warm/10">
        &ldquo;
      </span>
      <div className="mx-auto max-w-3xl text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl"
          >
            <p className="text-lg leading-relaxed italic text-cream">
              {item.quote}
            </p>
            <div className="mt-6">
              <p className="font-semibold text-cream">— {item.author}</p>
              {item.event && <p className="text-sm text-forest-300">{item.event}</p>}
              {item.rating && item.rating > 0 && (
                <div className="mt-2 text-accent-warm">
                  {'⭐'.repeat(item.rating)}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-6 flex items-center justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`h-2.5 w-2.5 rounded-full transition ${i === activeIndex ? 'bg-accent-warm' : 'bg-forest-600 hover:bg-forest-400'}`}
            aria-label={`Opinia ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
