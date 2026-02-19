'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartItemCount } from '@/lib/cart-store'
import { CheckoutWizard } from '@/components/checkout/CheckoutWizard'

export default function ZamowieniePage() {
  const [mounted, setMounted] = useState(false)
  const itemCount = useCartItemCount()
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && itemCount === 0) {
      router.replace('/koszyk')
    }
  }, [mounted, itemCount, router])

  if (!mounted || itemCount === 0) {
    return (
      <div className="min-h-screen bg-forest-900 px-4 pt-24 pb-20">
        <div className="mx-auto max-w-2xl">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-forest-800" />
          <div className="mt-8 h-96 animate-pulse rounded-xl bg-forest-800" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-forest-900 px-4 pt-24 pb-20">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-cream">Zamówienie</h1>
        <CheckoutWizard />
      </div>
    </div>
  )
}
