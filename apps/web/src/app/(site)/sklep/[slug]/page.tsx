import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from '@/lib/payload-client'
import { formatPrice } from '@/lib/format'
import { getMediaUrl, getMediaAlt } from '@/lib/media'
import { AnimatedSection, AnimatedItem } from '@/components/ui/AnimatedSection'
import { ProductCard } from '@/components/shop/ProductCard'
import { AddToCartButton } from '@/components/shop/AddToCartButton'

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

  const firstImage = product.images?.[0]?.image
  const imageUrl = getMediaUrl(firstImage)
  const imageAlt = getMediaAlt(firstImage, product.name)

  return (
    <div className="min-h-screen bg-forest-900 pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-forest-400">
          <Link href="/sklep" className="transition hover:text-accent">Sklep</Link>
          <span>›</span>
          {categoryName && (
            <>
              <span className="text-forest-400">{categoryName}</span>
              <span>›</span>
            </>
          )}
          <span className="text-forest-200">{product.name}</span>
        </nav>

        {/* Product detail */}
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left — Image */}
          <AnimatedSection>
            <div className="overflow-hidden rounded-xl bg-gradient-to-br from-forest-700 to-forest-800">
              {imageUrl ? (
                <div className="relative aspect-square">
                  <Image
                    src={imageUrl}
                    alt={imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center text-6xl">
                  🍽️
                </div>
              )}
            </div>
          </AnimatedSection>

          {/* Right — Info */}
          <AnimatedSection>
            <div>
              <h1 className="text-3xl font-bold text-cream">{product.name}</h1>

              <div className="mt-4 flex items-center gap-3">
                <span className="text-2xl font-bold text-accent">{formatPrice(product.price)}</span>
                {product.compareAtPrice && (
                  <span className="text-lg text-forest-400 line-through">{formatPrice(product.compareAtPrice)}</span>
                )}
              </div>

              {product.shortDescription && (
                <p className="mt-4 text-forest-200">{product.shortDescription}</p>
              )}

              <div className="my-6 border-t border-forest-700" />

              {/* Allergens */}
              {product.allergens && product.allergens.length > 0 && (
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-cream">Alergeny</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.allergens.map((a: string) => (
                      <span key={a} className="rounded-full border border-forest-600 bg-forest-700 px-3 py-1 text-sm text-forest-200">
                        {allergenLabels[a] || a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dietary */}
              {product.dietary && product.dietary.length > 0 && (
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-cream">Dieta</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.dietary.map((d: string) => {
                      const info = dietaryLabels[d]
                      return (
                        <span key={d} className={`rounded-full px-3 py-1 text-sm font-medium ${info?.color || 'bg-forest-700 text-forest-200'}`}>
                          {info?.label || d}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Weight / Servings */}
              {(product.weight || product.servings) && (
                <div className="mb-4 flex gap-6 text-sm text-forest-300">
                  {product.weight && <span>📦 Waga: {product.weight}</span>}
                  {product.servings && <span>👥 Porcje: {product.servings}</span>}
                </div>
              )}

              <div className="my-6 border-t border-forest-700" />

              {/* Add to cart */}
              <AddToCartButton product={{ id: product.id, name: product.name, slug: product.slug, price: product.price }} />
            </div>
          </AnimatedSection>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <AnimatedSection>
              <h2 className="text-2xl font-bold text-cream">Powiązane produkty</h2>
            </AnimatedSection>
            <AnimatedSection stagger>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((p) => (
                  <AnimatedItem key={p.id}>
                    <ProductCard product={p} />
                  </AnimatedItem>
                ))}
              </div>
            </AnimatedSection>
          </section>
        )}
      </div>
    </div>
  )
}
