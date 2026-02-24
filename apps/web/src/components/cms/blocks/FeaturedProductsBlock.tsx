import Link from 'next/link'
import Image from 'next/image'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { getPayload } from '@/lib/payload-client'
import { formatPrice } from '@/lib/format'
import { getMediaUrl } from '@/lib/media'
import type { PageSection } from '../types'

type FeaturedProductsProps = Extract<PageSection, { blockType: 'featuredProducts' }>

type FeaturedProduct = {
  id: number
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  shortDescription?: string | null
  images?: Array<{ image: { url?: string } | string }>
}

export async function FeaturedProductsBlock({ heading, limit, linkText, linkUrl }: FeaturedProductsProps) {
  let featuredProducts: FeaturedProduct[] = []
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'products',
      where: { isFeatured: { equals: true }, isAvailable: { equals: true } },
      limit: limit ?? 6,
      sort: 'sortOrder',
      depth: 2,
    })
    featuredProducts = result.docs as typeof featuredProducts
  } catch {
    // Payload not available during build
  }

  if (featuredProducts.length === 0) return null

  return (
    <section className="bg-forest-900 py-20">
      <div className="mx-auto max-w-7xl px-4">
        {heading && (
          <AnimatedSection>
            <h2 className="text-center text-3xl font-bold text-cream md:text-4xl">
              {heading}
            </h2>
          </AnimatedSection>
        )}
        <div className="mt-12 grid grid-flow-col auto-cols-[280px] gap-6 overflow-x-auto pb-4 snap-x">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/sklep/${product.slug}`}
              className="group flex h-full w-[280px] flex-col snap-start overflow-hidden rounded-xl border border-forest-700 bg-forest-800 transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-lg"
            >
              {(() => {
                const firstImg = product.images?.[0]?.image
                const imgUrl = getMediaUrl(firstImg)
                return imgUrl ? (
                  <div className="relative aspect-[5/4] overflow-hidden">
                    <Image
                      src={imgUrl}
                      alt={product.name}
                      fill
                      className="object-cover transition group-hover:scale-105"
                      sizes="280px"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[5/4] items-center justify-center bg-gradient-to-br from-forest-700 to-forest-800 text-4xl">
                    🍽️
                  </div>
                )
              })()}
              <div className="flex h-full flex-col p-4">
                <h3 className="font-semibold text-cream">{product.name}</h3>
                {product.shortDescription && (
                  <p className="mt-1 text-sm text-forest-300 line-clamp-1">{product.shortDescription}</p>
                )}
                <div className="mt-auto flex items-center gap-2 pt-3">
                  <span className="text-lg font-bold text-accent">{formatPrice(product.price)}</span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-forest-400 line-through">{formatPrice(product.compareAtPrice)}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
        {linkText && linkUrl && (
          <div className="mt-8 text-center">
            <Link href={linkUrl} className="text-sm font-medium text-accent transition hover:text-accent-light">
              {linkText}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
