'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart, useCartItemCount } from '@/lib/cart-store'
import { CartItem } from '@/components/cart/CartItem'
import { CartSummary } from '@/components/cart/CartSummary'

export default function KoszykPage() {
  const [mounted, setMounted] = useState(false)
  const { items } = useCart()
  const itemCount = useCartItemCount()

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-forest-900 px-4 pt-24 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-forest-800" />
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-forest-800" />
              ))}
            </div>
            <div className="h-64 animate-pulse rounded-xl bg-forest-800" />
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-forest-900 px-4 pt-24 pb-20">
        <div className="text-center">
          <svg className="mx-auto h-20 w-20 text-forest-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <h1 className="mt-6 text-3xl font-bold text-cream">Twój koszyk jest pusty</h1>
          <p className="mt-4 text-forest-300">Dodaj produkty do koszyka, aby kontynuować.</p>
          <Link
            href="/sklep"
            className="mt-8 inline-flex items-center rounded-lg bg-accent px-8 py-3 text-base font-semibold text-forest-950 transition hover:bg-accent-light"
          >
            Przejdź do sklepu
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-forest-900 px-4 pt-24 pb-20">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-cream">
          Twój koszyk <span className="text-forest-400">({itemCount})</span>
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <CartItem key={item.productId} item={item} />
            ))}
          </div>
          <div className="lg:sticky lg:top-24 lg:self-start">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  )
}
