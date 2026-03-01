import Link from 'next/link'
import Image from 'next/image'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { getPayload } from '@/lib/payload-client'
import { formatPrice } from '@/lib/format'
import { getMediaUrl } from '@/lib/media'
import type { PageSection } from '../types'
import { FeaturedProductsScroll } from './FeaturedProductsScroll'

type FeaturedProductsProps = Extract<PageSection, { blockType: 'featuredProducts' }>

type FeaturedProduct = {
  id: number
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  shortDescription?: string | null
  images?: Array<{ image: { url?: string } | string }>
  imageUrl?: string | null
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

  const cards = featuredProducts.map((product) => {
    const firstImg = product.images?.[0]?.image
    const imgUrl = getMediaUrl(firstImg) || product.imageUrl || undefined
    return { id: product.id, name: product.name, slug: product.slug, price: product.price, compareAtPrice: product.compareAtPrice, shortDescription: product.shortDescription, imgUrl }
  })

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
        <FeaturedProductsScroll cards={cards} />
        <div className="mt-8 text-center">
          {linkText && linkUrl ? (
            <Link href={linkUrl} className="text-sm font-medium text-accent transition hover:text-accent-light">
              {linkText}
            </Link>
          ) : (
            <Link href="/sklep" className="text-sm font-medium text-accent-warm transition hover:text-accent-warm-light">
              Zobacz wszystkie →
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
