'use client'

import Link from 'next/link'
import { useCartSubtotal, useCartDeliveryFee, useCartTotal, useCanCheckout, useCartItemCount, FREE_DELIVERY_THRESHOLD, MIN_ORDER_AMOUNT } from '@/lib/cart-store'
import { formatPrice } from '@/lib/format'

export function CartSummary() {
  const subtotal = useCartSubtotal()
  const deliveryFee = useCartDeliveryFee()
  const total = useCartTotal()
  const canCheckout = useCanCheckout()
  const itemCount = useCartItemCount()

  return (
    <div className="rounded-xl bg-forest-800 p-6">
      <h2 className="text-lg font-bold text-cream">Podsumowanie</h2>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm text-forest-200">
          <span>Suma częściowa</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-forest-300">Dostawa</span>
          <span className={deliveryFee === 0 ? 'text-accent' : 'text-forest-300'}>
            {deliveryFee === 0 ? '✓ Darmowa dostawa!' : formatPrice(deliveryFee)}
          </span>
        </div>
        {deliveryFee > 0 && (
          <p className="text-xs text-forest-400">
            Darmowa dostawa od {formatPrice(FREE_DELIVERY_THRESHOLD)}
          </p>
        )}
      </div>

      {itemCount > 0 && subtotal < MIN_ORDER_AMOUNT && (
        <div className="mt-3 rounded-lg bg-amber-900/30 px-3 py-2 text-sm text-amber-300">
          Minimalna wartość zamówienia: {formatPrice(MIN_ORDER_AMOUNT)}
        </div>
      )}

      <div className="mt-4 border-t border-forest-700 pt-4">
        <div className="flex justify-between text-lg font-bold">
          <span className="text-cream">Razem:</span>
          <span className="text-accent">{formatPrice(total)}</span>
        </div>
      </div>

      <Link
        href={canCheckout ? '/zamowienie' : '#'}
        onClick={(e) => { if (!canCheckout) e.preventDefault() }}
        className={`mt-4 block w-full rounded-lg py-3.5 text-center text-base font-semibold transition ${
          canCheckout
            ? 'bg-accent text-forest-950 hover:bg-accent-light'
            : 'cursor-not-allowed bg-forest-600 text-forest-400'
        }`}
      >
        Przejdź do zamówienia
      </Link>

      <Link
        href="/sklep"
        className="mt-3 block w-full text-center text-sm text-forest-300 transition hover:text-accent"
      >
        Kontynuuj zakupy
      </Link>
    </div>
  )
}
