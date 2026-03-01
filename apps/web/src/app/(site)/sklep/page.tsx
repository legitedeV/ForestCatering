import Link from 'next/link'
import { getPayload } from '@/lib/payload-client'
import type { Where } from 'payload'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { ProductCard } from '@/components/shop/ProductCard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ProductDoc {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  shortDescription?: string | null
  allergens?: string[] | null
  dietary?: string[] | null
  images?: Array<{ image: { url?: string; alt?: string } | string }> | null
  imageUrl?: string | null
}

interface Props {
  searchParams: Promise<{ category?: string; diet?: string; sort?: string; page?: string }>
}

interface CategoryDoc { id: string; slug: string; name: string }

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const perPage = 12

  let products: ProductDoc[] = []
  let categories: CategoryDoc[] = []
  let totalPages = 1

  try {
    const payload = await getPayload()
    const catResult = await payload.find({ collection: 'categories', sort: 'sortOrder', limit: 50 })
    categories = catResult.docs as unknown as CategoryDoc[]

    const where: Where = { isAvailable: { equals: true } }
    if (params.category) {
      const cat = categories.find((c) => c.slug === params.category)
      if (cat) where.category = { equals: cat.id }
    }
    if (params.diet) {
      where.dietary = { contains: params.diet }
    }

    let sort: string = 'sortOrder'
    if (params.sort === 'price-asc') sort = 'price'
    else if (params.sort === 'price-desc') sort = '-price'
    else if (params.sort === 'name') sort = 'name'

    const result = await payload.find({
      collection: 'products',
      where,
      sort,
      limit: perPage,
      page: currentPage,
      depth: 2,
    })
    products = result.docs as unknown as ProductDoc[]
    totalPages = result.totalPages
  } catch {
    // Payload not available during build
  }

  return (
    <div className="min-h-screen bg-forest-900 pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4">
        <AnimatedSection>
          <h1 className="text-3xl font-bold text-cream md:text-4xl">Nasz sklep</h1>
          <div className="mt-3 w-20 gradient-line" />
          <p className="mt-4 text-forest-200">Sprawdź co dla Ciebie przygotowaliśmy</p>
        </AnimatedSection>

        {/* Sticky filter bar */}
        <div className="sticky top-[72px] z-20 -mx-4 mt-8 border-b border-forest-800 bg-forest-900/95 px-4 py-3 backdrop-blur-md">
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Link
              href="/sklep"
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition ${!params.category ? 'border-accent-warm bg-accent-warm text-forest-950' : 'border-forest-700 bg-forest-800 text-forest-200 hover:border-accent-warm/50'}`}
            >
              Wszystkie
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/sklep?category=${cat.slug}${params.diet ? `&diet=${params.diet}` : ''}${params.sort ? `&sort=${params.sort}` : ''}`}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition ${params.category === cat.slug ? 'border-accent-warm bg-accent-warm text-forest-950' : 'border-forest-700 bg-forest-800 text-forest-200 hover:border-accent-warm/50'}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Dietary + Sort row */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Wegetariańskie', value: 'vegetarian' },
                { label: 'Wegańskie', value: 'vegan' },
                { label: 'Bezglutenowe', value: 'gluten-free' },
                { label: 'Low-carb', value: 'low-carb' },
              ].map((d) => (
                <Link
                  key={d.value}
                  href={`/sklep?${params.category ? `category=${params.category}&` : ''}${params.diet === d.value ? '' : `diet=${d.value}&`}${params.sort ? `sort=${params.sort}` : ''}`}
                  className={`rounded-full border px-3 py-1 text-xs transition ${params.diet === d.value ? 'border-accent-warm bg-accent-warm text-forest-950' : 'border-forest-700 bg-forest-800 text-forest-300 hover:border-accent-warm/50'}`}
                >
                  {d.label}
                </Link>
              ))}
            </div>
            <div className="flex gap-1.5">
              {[
                { label: 'Polecane', value: '' },
                { label: 'Cena ↑', value: 'price-asc' },
                { label: 'Cena ↓', value: 'price-desc' },
                { label: 'A-Z', value: 'name' },
              ].map((s) => (
                <Link
                  key={s.value}
                  href={`/sklep?${params.category ? `category=${params.category}&` : ''}${params.diet ? `diet=${params.diet}&` : ''}${s.value ? `sort=${s.value}` : ''}`}
                  className={`rounded-full border px-3 py-1 text-xs transition ${(params.sort || '') === s.value ? 'border-accent-warm bg-accent-warm text-forest-950' : 'border-forest-700 bg-forest-800 text-forest-300 hover:border-accent-warm/50'}`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Product grid */}
        <div className="mt-8">
          {products.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-forest-400">Znalezione produkty: {products.length}</p>
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <div key={product.id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  {currentPage > 1 && (
                    <Link
                      href={`/sklep?${params.category ? `category=${params.category}&` : ''}${params.diet ? `diet=${params.diet}&` : ''}${params.sort ? `sort=${params.sort}&` : ''}page=${currentPage - 1}`}
                      className="rounded-lg border border-forest-700 bg-forest-800 px-4 py-2 text-sm text-forest-200 transition hover:border-accent-warm/50"
                    >
                      ← Poprzednia
                    </Link>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/sklep?${params.category ? `category=${params.category}&` : ''}${params.diet ? `diet=${params.diet}&` : ''}${params.sort ? `sort=${params.sort}&` : ''}page=${p}`}
                      className={`rounded-lg border px-3 py-2 text-sm transition ${p === currentPage ? 'border-accent-warm bg-accent-warm text-forest-950' : 'border-forest-700 bg-forest-800 text-forest-200 hover:border-accent-warm/50'}`}
                      {...(p === currentPage ? { 'aria-current': 'page' as const } : {})}
                    >
                      {p}
                    </Link>
                  ))}
                  {currentPage < totalPages && (
                    <Link
                      href={`/sklep?${params.category ? `category=${params.category}&` : ''}${params.diet ? `diet=${params.diet}&` : ''}${params.sort ? `sort=${params.sort}&` : ''}page=${currentPage + 1}`}
                      className="rounded-lg border border-forest-700 bg-forest-800 px-4 py-2 text-sm text-forest-200 transition hover:border-accent-warm/50"
                    >
                      Następna →
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-5xl">🔍</span>
              <p className="mt-4 text-lg text-forest-200">Brak produktów w tej kategorii</p>
              <Link href="/sklep" className="mt-4 text-sm font-medium text-accent-warm transition hover:text-accent-warm-light">
                Wróć do wszystkich →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
