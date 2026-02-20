'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatPrice } from '@/lib/format'
import { useCart } from '@/lib/cart-store'
import { useToast } from '@/components/ui/Toast'

const allergenEmoji: Record<string, string> = {
  gluten: '🌾', dairy: '🥛', eggs: '🥚', nuts: '🥜', soy: '🫘',
  fish: '🐟', shellfish: '🦐', celery: '🥬', mustard: '🟡',
  sesame: '⚪', lupine: '🌸', mollusks: '🐚',
}

const dietaryLabels: Record<string, { label: string; color: string }> = {
  vegetarian: { label: 'Vege', color: 'bg-green-700/50 text-green-200' },
  vegan: { label: 'Wegańskie', color: 'bg-green-800/50 text-green-200' },
  'gluten-free': { label: 'Bez glutenu', color: 'bg-blue-800/50 text-blue-200' },
  'low-carb': { label: 'Low-carb', color: 'bg-purple-800/50 text-purple-200' },
}

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    compareAtPrice?: number | null
    shortDescription?: string | null
    allergens?: string[] | null
    dietary?: string[] | null
    images?: Array<{ image: { url?: string } | string }> | null
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { show } = useToast()

  return (
    <motion.div
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-forest-700 bg-forest-800 transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-lg"
      whileHover={{ y: -2 }}
    >
      <Link href={`/sklep/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-forest-700 to-forest-800">
          <div className="flex h-full items-center justify-center text-4xl transition group-hover:scale-105">
            🍽️
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/sklep/${product.slug}`}>
          <h3 className="font-semibold text-cream transition group-hover:text-accent">{product.name}</h3>
          {product.shortDescription && (
            <p className="mt-1 text-sm text-forest-300 line-clamp-2">{product.shortDescription}</p>
          )}
        </Link>

        {/* Allergens */}
        {product.allergens && product.allergens.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {product.allergens.map((a) => (
              <span key={a} className="text-sm" title={a}>{allergenEmoji[a] || '⚠️'}</span>
            ))}
          </div>
        )}

        {/* Dietary badges */}
        {product.dietary && product.dietary.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {product.dietary.map((d) => {
              const info = dietaryLabels[d]
              return info ? (
                <span key={d} className={`rounded-full px-2 py-0.5 text-xs font-medium ${info.color}`}>
                  {info.label}
                </span>
              ) : null
            })}
          </div>
        )}

        <div className="mt-auto pt-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-accent">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-forest-400 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>
          <button
            onClick={() => {
              addItem({
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
              })
              show('Dodano do koszyka ✓', 'success')
            }}
            className="mt-3 w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-forest-950 transition hover:bg-accent-light"
          >
            Dodaj do koszyka
          </button>
        </div>
      </div>
    </motion.div>
  )
}
