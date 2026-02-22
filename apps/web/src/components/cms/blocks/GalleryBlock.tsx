import Image from 'next/image'
import { AnimatedSection, AnimatedItem } from '@/components/ui/AnimatedSection'
import { getMediaUrl, getMediaAlt } from '@/lib/media'
import type { PageSection } from '../types'

type GalleryProps = Extract<PageSection, { blockType: 'gallery' }>

export function GalleryBlock({ images }: GalleryProps) {
  if (!images || images.length === 0) return null

  return (
    <section className="bg-forest-900 py-16">
      <div className="mx-auto max-w-7xl px-4">
        <AnimatedSection stagger>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {images.map((item, i) => {
              const url = getMediaUrl(item.image)
              const alt = getMediaAlt(item.image, '')
              if (!url) return null
              return (
                <AnimatedItem key={item.id ?? i}>
                  <div className="group relative aspect-square overflow-hidden rounded-lg">
                    <Image
                      src={url}
                      alt={alt}
                      fill
                      loading="lazy"
                      className="object-cover transition group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                </AnimatedItem>
              )
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
