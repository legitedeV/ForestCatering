'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import type { PageSection } from '../types'
import { getMediaUrl } from '@/lib/media'

type GalleryFullProps = Extract<PageSection, { blockType: 'galleryFull' }>

export function GalleryFullBlock({ heading, items }: GalleryFullProps) {
  const [activeCategory, setActiveCategory] = useState('')

  const categories = useMemo(() => {
    const entries = new Map<string, string>()
    entries.set('', 'Wszystkie')
    items?.forEach((item) => {
      if (item.category) entries.set(item.category, item.categoryLabel || item.category)
    })
    return Array.from(entries.entries())
  }, [items])

  const filteredItems = useMemo(() => {
    if (!items) return []
    return activeCategory ? items.filter((item) => item.category === activeCategory) : items
  }, [activeCategory, items])

  if (!filteredItems.length) return null

  return (
    <section className="bg-forest-900 py-20">
      <div className="mx-auto max-w-7xl px-4">
        {heading && <h2 className="text-center text-3xl font-bold text-cream md:text-5xl">{heading}</h2>}

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {categories.map(([value, label]) => (
            <button
              key={value}
              onClick={() => setActiveCategory(value)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${activeCategory === value ? 'border-accent bg-accent text-forest-950' : 'border-forest-700 bg-forest-800 text-forest-200 hover:border-accent/50'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {filteredItems.map((item, index) => {
            const url = getMediaUrl(item.image)
            if (!url) return null
            return (
              <div key={item.id ?? index} className="group relative mb-4 overflow-hidden rounded-lg break-inside-avoid">
                <Image
                  src={url}
                  alt={item.alt || `Galeria ${index + 1}`}
                  width={800}
                  height={index % 3 === 0 ? 1067 : 800}
                  className={`w-full object-cover transition group-hover:scale-105 ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'}`}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
