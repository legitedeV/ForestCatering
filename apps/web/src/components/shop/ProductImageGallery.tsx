'use client'

import { useState } from 'react'
import Image from 'next/image'

interface GalleryImage {
  url: string
  alt: string
}

interface ProductImageGalleryProps {
  images: GalleryImage[]
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-forest-700 to-forest-800 text-6xl">
        🍽️
      </div>
    )
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-forest-700 to-forest-800">
        <Image
          src={images[activeIndex].url}
          alt={images[activeIndex].alt || productName}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 transition ${i === activeIndex ? 'border-accent-warm' : 'border-forest-700 hover:border-forest-500'}`}
            >
              <Image
                src={img.url}
                alt={img.alt || `${productName} ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
