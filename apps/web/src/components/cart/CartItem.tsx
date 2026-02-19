'use client'

import Link from 'next/link'
import { useCart, type CartItem as CartItemType } from '@/lib/cart-store'
import { formatPrice } from '@/lib/format'
import { QuantityControl } from './QuantityControl'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <div className="flex items-center gap-4 rounded-xl border border-forest-700 bg-forest-800 p-4">
      <Link href={`/sklep/${item.slug}`} className="flex-shrink-0">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-forest-700 text-2xl">
          🍽️
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex-1 min-w-0">
          <Link
            href={`/sklep/${item.slug}`}
            className="font-medium text-cream transition hover:text-accent truncate block"
          >
            {item.name}
          </Link>
          <p className="text-sm text-forest-300">{formatPrice(item.price)}/szt.</p>
        </div>
        <QuantityControl
          quantity={item.quantity}
          onChange={(qty) => updateQuantity(item.productId, qty)}
        />
        <p className="text-right font-bold text-accent min-w-[5rem]">
          {formatPrice(item.price * item.quantity)}
        </p>
      </div>
      <button
        onClick={() => removeItem(item.productId)}
        className="flex-shrink-0 text-forest-400 transition hover:text-red-400"
        aria-label={`Usuń ${item.name}`}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}
