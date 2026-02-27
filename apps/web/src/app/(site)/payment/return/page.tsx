'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

interface OrderStatusResponse {
  orderNumber: string
  status: 'pending_payment' | 'paid' | 'failed' | string
  paymentProvider?: 'p24' | 'dotpay' | string
  transactionId?: string
  total: number
}

export default function PaymentReturnPage() {
  const [order, setOrder] = useState<OrderStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const orderNumber = useMemo(() => {
    if (typeof window === 'undefined') return ''
    return new URLSearchParams(window.location.search).get('orderNumber') || ''
  }, [])

  useEffect(() => {
    if (!orderNumber) {
      setError('Brak numeru zamówienia w adresie powrotu.')
      setLoading(false)
      return
    }

    let active = true
    let interval: ReturnType<typeof setInterval> | null = null

    const fetchStatus = async () => {
      const res = await fetch(`/api/payments/order-status?orderNumber=${encodeURIComponent(orderNumber)}`)
      const data = await res.json()

      if (!active) return
      if (!res.ok) {
        setError(data.error || 'Nie udało się pobrać statusu płatności.')
        setLoading(false)
        return
      }

      setOrder(data)
      setLoading(false)

      if (data.status === 'paid' || data.status === 'failed') {
        if (interval) clearInterval(interval)
      }
    }

    fetchStatus().catch(() => {
      if (!active) return
      setError('Nie udało się pobrać statusu płatności.')
      setLoading(false)
    })

    interval = setInterval(() => {
      fetchStatus().catch(() => {
        if (!active) return
        setError('Nie udało się odświeżyć statusu płatności.')
      })
    }, 4000)

    return () => {
      active = false
      if (interval) clearInterval(interval)
    }
  }, [orderNumber])

  const statusLabel = order?.status === 'paid'
    ? 'Płatność została potwierdzona'
    : order?.status === 'failed'
      ? 'Płatność nie powiodła się'
      : 'Oczekujemy na potwierdzenie płatności'

  return (
    <div className="min-h-screen bg-forest-900 px-4 pb-20 pt-24">
      <div className="mx-auto max-w-2xl rounded-xl border border-forest-700 bg-forest-800 p-8 text-cream">
        <h1 className="text-2xl font-bold">Status płatności</h1>

        {loading && <p className="mt-4 text-forest-300">Sprawdzanie statusu...</p>}
        {error && <p className="mt-4 text-red-300">{error}</p>}

        {order && !loading && (
          <div className="mt-6 space-y-3">
            <p>
              Zamówienie: <strong>{order.orderNumber}</strong>
            </p>
            <p>{statusLabel}</p>
            {order.paymentProvider && <p>Operator: <strong>{order.paymentProvider.toUpperCase()}</strong></p>}
            {order.transactionId && <p>ID transakcji: <strong>{order.transactionId}</strong></p>}
            <p>
              Status systemowy: <code className="rounded bg-forest-700 px-2 py-1">{order.status}</code>
            </p>
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <Link href="/sklep" className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-forest-950">
            Wróć do sklepu
          </Link>
          <Link href="/koszyk" className="rounded-lg border border-forest-600 px-5 py-2.5 text-forest-200">
            Koszyk
          </Link>
        </div>
      </div>
    </div>
  )
}
