import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from '@/lib/payload-client'
import { formatPrice } from '@/lib/format'
import { getMediaUrl, getMediaAlt } from '@/lib/media'
import { AnimatedSection, AnimatedItem } from '@/components/ui/AnimatedSection'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { ProductCard } from '@/components/shop/ProductCard'
import { ProductImageGallery } from '@/components/shop/ProductImageGallery'
import { ProductTabs } from '@/components/shop/ProductTabs'
import { AddToCartButton } from '@/components/shop/AddToCartButton'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const allergenLabels: Record<string, string> = {
  gluten: '🌾 Gluten', dairy: '🥛 Nabiał', eggs: '🥚 Jaja', nuts: '🥜 Orzechy',
  soy: '🫘 Soja', fish: '🐟 Ryby', shellfish: '🦐 Skorupiaki', celery: '🥬 Seler',
  mustard: '🟡 Gorczyca', sesame: '⚪ Sezam', lupine: '🌸 Łubin', mollusks: '🐚 Mięczaki',
}

const dietaryLabels: Record<string, { label: string; color: string }> = {
  vegetarian: { label: 'Wegetariańskie', color: 'bg-green-700/50 text-green-200' },
  vegan: { label: 'Wegańskie', color: 'bg-green-800/50 text-green-200' },
  'gluten-free': { label: 'Bezglutenowe', color: 'bg-blue-800/50 text-blue-200' },
  'low-carb': { label: 'Low-carb', color: 'bg-purple-800/50 text-purple-200' },
}

interface ProductDoc {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  shortDescription?: string | null
  description?: unknown
  allergens?: string[] | null
  dietary?: string[] | null
  weight?: string | null
  servings?: number | null
  category?: { id: string; name?: string } | string
  images?: Array<{ image: { url?: string; alt?: string } | string }> | null
  imageUrl?: string | null
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params

  let product: ProductDoc | null = null
  let relatedProducts: ProductDoc[] = []
  let categoryName = ''

  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
    })
    product = (result.docs[0] as unknown as ProductDoc) || null

    if (product && product.category) {
      const catId = typeof product.category === 'object' ? product.category.id : product.category
      categoryName = typeof product.category === 'object' ? product.category.name || '' : ''

      const related = await payload.find({
        collection: 'products',
        where: {
          category: { equals: catId },
          id: { not_equals: product.id },
          isAvailable: { equals: true },
        },
        limit: 4,
        sort: 'sortOrder',
        depth: 2,
      })
      relatedProducts = related.docs as unknown as ProductDoc[]
    }
  } catch {
    // Payload not available during build
  }

  if (!product) notFound()

  const allImages = (product.images ?? [])
    .map((img) => {
      const url = getMediaUrl(img.image)
      const alt = getMediaAlt(img.image, product.name)
      return url ? { url, alt } : null
    })
    .filter((img): img is { url: string; alt: string } => img !== null)

  // Fallback to imageUrl if no uploaded images
  if (allImages.length === 0 && product.imageUrl) {
    allImages.push({ url: product.imageUrl, alt: product.name })
  }

  const allergenItems = product.allergens?.map((a: string) => ({
    key: a,
    label: allergenLabels[a] || a,
  })) ?? null

  const dietaryItems = product.dietary?.map((d: string) => {
    const info = dietaryLabels[d]
    return {
      key: d,
      label: info?.label || d,
      color: info?.color || 'bg-forest-700 text-forest-200',
    }
  }) ?? null

  const breadcrumbItems = [
    { label: 'Sklep', href: '/sklep' },
    ...(categoryName ? [{ label: categoryName }] : []),
    { label: product.name },
  ]

  return (
    <div className="min-h-screen bg-forest-900 pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4">
        {/* Breadcrumb */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Product detail */}
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left — Image Gallery */}
          <AnimatedSection>
            <ProductImageGallery images={allImages} productName={product.name} />
          </AnimatedSection>

          {/* Right — Info */}
          <AnimatedSection>
            <div>
              <h1 className="text-3xl font-bold text-cream">{product.name}</h1>

              <div className="mt-4 flex items-center gap-3">
                <span className="text-2xl font-bold text-accent-warm">{formatPrice(product.price)}</span>
                {product.compareAtPrice && (
                  <span className="text-lg text-forest-400 line-through">{formatPrice(product.compareAtPrice)}</span>
                )}
              </div>

              {product.shortDescription && (
                <p className="mt-4 text-forest-200">{product.shortDescription}</p>
              )}

              <div className="my-6 border-t border-forest-700" />

              {/* Add to cart */}
              <AddToCartButton product={{ id: product.id, name: product.name, slug: product.slug, price: product.price }} imageUrl={allImages[0]?.url} />

              <div className="my-6 border-t border-forest-700" />

              {/* Tabs */}
              <ProductTabs
                description={product.shortDescription}
                allergens={allergenItems}
                dietary={dietaryItems}
                weight={product.weight}
                servings={product.servings}
              />
            </div>
          </AnimatedSection>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <AnimatedSection>
              <h2 className="text-2xl font-bold text-cream">Powiązane produkty</h2>
            </AnimatedSection>
            <div className="product-scroll mt-8">
              {relatedProducts.map((p) => (
                <div key={p.id} className="w-[280px] shrink-0 sm:w-[320px]">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
