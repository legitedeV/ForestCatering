'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart, useCartItemCount, useCartSubtotal, useCartDeliveryFee, useCartTotal, useCanCheckout, FREE_DELIVERY_THRESHOLD, MIN_ORDER_AMOUNT } from '@/lib/cart-store'
import { formatPrice } from '@/lib/format'

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeItem } = useCart()
  const itemCount = useCartItemCount()
  const subtotal = useCartSubtotal()
  const deliveryFee = useCartDeliveryFee()
  const total = useCartTotal()
  const canCheckout = useCanCheckout()

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-forest-950/70"
            onClick={closeDrawer}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-forest-700 bg-forest-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-forest-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-cream">Koszyk</h2>
                {itemCount > 0 && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-forest-950">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeDrawer}
                className="text-forest-300 transition hover:text-cream"
                aria-label="Zamknij koszyk"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items list */}
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
                <svg className="h-16 w-16 text-forest-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <p className="text-forest-300">Twój koszyk jest pusty</p>
                <Link
                  href="/sklep"
                  onClick={closeDrawer}
                  className="text-accent transition hover:text-accent-light"
                >
                  Przejdź do sklepu →
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item.productId} className="flex items-center gap-3 rounded-lg bg-forest-800 p-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-forest-700 text-xl">
                          🍽️
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/sklep/${item.slug}`}
                            onClick={closeDrawer}
                            className="text-sm font-medium text-cream transition hover:text-accent truncate block"
                          >
                            {item.name}
                          </Link>
                          <p className="text-sm text-accent">{formatPrice(item.price)}</p>
                        </div>
                        <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded bg-forest-600 px-1.5 text-xs font-medium text-cream">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-forest-400 transition hover:text-red-400"
                          aria-label={`Usuń ${item.name}`}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-forest-700 bg-forest-800 p-4">
                  <div className="flex justify-between text-sm text-forest-200">
                    <span>Suma częściowa</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-sm">
                    <span className="text-forest-300">Dostawa</span>
                    <span className={deliveryFee === 0 ? 'text-accent' : 'text-forest-300'}>
                      {deliveryFee === 0 ? '✓ Darmowa dostawa!' : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  {deliveryFee > 0 && (
                    <p className="mt-1 text-xs text-forest-400">
                      Darmowa dostawa od {formatPrice(FREE_DELIVERY_THRESHOLD)}
                    </p>
                  )}
                  <div className="mt-3 flex justify-between text-lg font-bold">
                    <span className="text-cream">Razem:</span>
                    <span className="text-accent">{formatPrice(total)}</span>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <Link
                      href="/koszyk"
                      onClick={closeDrawer}
                      className="block w-full rounded-lg border border-cream/30 py-2.5 text-center text-sm font-semibold text-cream transition hover:bg-cream/10"
                    >
                      Przejdź do koszyka
                    </Link>
                    <Link
                      href={canCheckout ? '/zamowienie' : '#'}
                      onClick={(e) => {
                        if (!canCheckout) { e.preventDefault(); return }
                        closeDrawer()
                      }}
                      className={`block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition ${
                        canCheckout
                          ? 'bg-accent text-forest-950 hover:bg-accent-light'
                          : 'cursor-not-allowed bg-forest-600 text-forest-400'
                      }`}
                    >
                      Zamów teraz
                    </Link>
                    {!canCheckout && itemCount > 0 && (
                      <p className="text-center text-xs text-amber-400">
                        Minimalna wartość zamówienia: {formatPrice(MIN_ORDER_AMOUNT)}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
