'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/format'

interface CardData {
  id: number
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  shortDescription?: string | null
  imgUrl?: string
}

interface FeaturedProductsScrollProps {
  cards: CardData[]
}

export function FeaturedProductsScroll({ cards }: FeaturedProductsScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 320
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <div>
      <div className="mt-10 flex items-center justify-end gap-2">
        <button
          onClick={() => scroll('left')}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-forest-700 bg-forest-800 text-cream transition hover:border-accent-warm"
          aria-label="Przewiń w lewo"
        >
          ←
        </button>
        <button
          onClick={() => scroll('right')}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-forest-700 bg-forest-800 text-cream transition hover:border-accent-warm"
          aria-label="Przewiń w prawo"
        >
          →
        </button>
      </div>
      <div ref={scrollRef} className="product-scroll mt-4">
        {cards.map((product) => (
          <Link
            key={product.id}
            href={`/sklep/${product.slug}`}
            className="group flex w-[280px] flex-col overflow-hidden rounded-xl border border-forest-700 bg-forest-800 transition hover:-translate-y-0.5 hover:border-accent-warm/30 hover:shadow-lg sm:w-[320px] lg:w-[calc(33.333%-1rem)]"
          >
            {product.imgUrl ? (
              <div className="relative aspect-[5/4] overflow-hidden">
                <Image
                  src={product.imgUrl}
                  alt={product.name}
                  fill
                  className="object-cover transition group-hover:scale-105"
                  sizes="320px"
                />
              </div>
            ) : (
              <div className="flex aspect-[5/4] items-center justify-center bg-gradient-to-br from-forest-700 to-forest-800 text-4xl">
                🍽️
              </div>
            )}
            <div className="flex h-full flex-col p-4">
              <h3 className="font-semibold text-cream">{product.name}</h3>
              {product.shortDescription && (
                <p className="mt-1 text-sm text-forest-300 line-clamp-1">{product.shortDescription}</p>
              )}
              <div className="mt-auto flex items-center gap-2 pt-3">
                <span className="text-lg font-bold text-accent-warm">{formatPrice(product.price)}</span>
                {product.compareAtPrice && (
                  <span className="text-sm text-forest-400 line-through">{formatPrice(product.compareAtPrice)}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
