'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '@/lib/cart-store'
import { useToast } from '@/components/ui/Toast'

interface Props {
  product: { id: string; name: string; slug: string; price: number }
  imageUrl?: string
}

export function AddToCartButton({ product, imageUrl }: Props) {
  const [qty, setQty] = useState(1)
  const { addItem } = useCart()
  const { show } = useToast()

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-forest-700 bg-forest-700 text-cream transition hover:border-accent"
        >
          −
        </button>
        <span className="w-12 text-center text-lg font-semibold text-cream">{qty}</span>
        <button
          onClick={() => setQty((q) => Math.min(99, q + 1))}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-forest-700 bg-forest-700 text-cream transition hover:border-accent"
        >
          +
        </button>
      </div>
      <motion.button
        onClick={() => { addItem({ productId: product.id, name: product.name, slug: product.slug, price: product.price, image: imageUrl }, qty); show('Dodano do koszyka ✓', 'success') }}
        className="w-full rounded-lg bg-accent py-3.5 text-base font-semibold text-forest-950 transition hover:bg-accent-light"
        whileTap={{ scale: 0.97 }}
      >
        Dodaj do koszyka
      </motion.button>
    </div>
  )
}
