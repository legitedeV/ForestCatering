'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCart, useCartTotal } from '@/lib/cart-store'
import { formatPrice } from '@/lib/format'

interface StepConfirmationProps {
  orderNumber: string
  paymentMethod: 'transfer' | 'cash'
}

export function StepConfirmation({ orderNumber, paymentMethod }: StepConfirmationProps) {
  const { clearCart } = useCart()
  const total = useCartTotal()

  useEffect(() => {
    clearCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto max-w-2xl text-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-700"
      >
        <svg className="h-10 w-10 text-green-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>

      <h2 className="mt-6 text-3xl font-bold text-cream">Dziękujemy za zamówienie!</h2>
      <p className="mt-4 text-2xl font-bold text-accent">{orderNumber}</p>

      <div className="mt-8 rounded-xl border border-forest-700 bg-forest-800 p-6 text-left">
        <h3 className="mb-3 text-lg font-bold text-cream">Co dalej?</h3>
        {paymentMethod === 'transfer' ? (
          <div className="text-forest-200">
            <p>Prosimy o przelew na konto:</p>
            <p className="mt-2 font-mono text-sm text-cream">Bank: mBank</p>
            <p className="font-mono text-sm text-cream">Nr konta: 00 1140 0000 0000 0000 0000 0000</p>
            <p className="mt-2 text-sm text-forest-300">
              W tytule podaj numer zamówienia: <strong className="text-accent">{orderNumber}</strong>
            </p>
          </div>
        ) : (
          <p className="text-forest-200">
            Kwota do zapłaty przy odbiorze: <strong className="text-accent">{formatPrice(total)}</strong>
          </p>
        )}
      </div>

      <Link
        href="/sklep"
        className="mt-8 inline-flex items-center rounded-lg bg-accent px-8 py-3 text-base font-semibold text-forest-950 transition hover:bg-accent-light"
      >
        Wróć do sklepu
      </Link>
    </div>
  )
}
