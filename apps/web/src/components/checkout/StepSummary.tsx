'use client'

import { useState } from 'react'
import { useCart, useCartSubtotal, useCartDeliveryFee, useCartTotal } from '@/lib/cart-store'
import { formatPrice } from '@/lib/format'
import { useToast } from '@/components/ui/Toast'
import type { CheckoutContact, CheckoutDelivery } from '@/lib/validators'

interface StepSummaryProps {
  contact: CheckoutContact
  delivery: CheckoutDelivery
  paymentMethod: 'p24' | 'dotpay'
  onPaymentChange: (method: 'p24' | 'dotpay') => void
  onBack: () => void
  onOrderCreated: (orderNumber: string) => void
}

export function StepSummary({
  contact,
  delivery,
  paymentMethod,
  onPaymentChange,
  onBack,
  onOrderCreated,
}: StepSummaryProps) {
  const [loading, setLoading] = useState(false)
  const { items } = useCart()
  const subtotal = useCartSubtotal()
  const deliveryFee = useCartDeliveryFee()
  const total = useCartTotal()
  const { show } = useToast()

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('pl-PL', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    } catch {
      return iso
    }
  }

  const handleOrder = async () => {
    setLoading(true)
    try {
      const createOrderRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: contact,
          delivery,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          paymentMethod,
        }),
      })
      const createOrderData = await createOrderRes.json()
      if (!createOrderRes.ok) {
        show(createOrderData.error || 'Wystąpił błąd', 'error')
        setLoading(false)
        return
      }

      onOrderCreated(createOrderData.orderNumber)

      const sessionRes = await fetch(`/api/payments/${paymentMethod}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: createOrderData.orderNumber }),
      })
      const sessionData = await sessionRes.json()
      if (!sessionRes.ok || !sessionData.redirectUrl) {
        show(sessionData.error || 'Nie udało się utworzyć sesji płatności', 'error')
        setLoading(false)
        return
      }

      window.location.href = sessionData.redirectUrl as string
    } catch {
      show('Wystąpił błąd podczas składania zamówienia. Spróbuj ponownie.', 'error')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-xl border border-forest-700 bg-forest-800 p-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-forest-300">Dane kontaktowe</h3>
        <p className="text-cream">{contact.name}</p>
        <p className="text-sm text-forest-300">{contact.email} · {contact.phone}</p>
      </div>

      <div className="rounded-xl border border-forest-700 bg-forest-800 p-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-forest-300">Dostawa</h3>
        <p className="text-cream">{delivery.street}, {delivery.postalCode} {delivery.city}</p>
        <p className="text-sm text-forest-300">{formatDate(delivery.deliveryDate)}, godz. {delivery.deliveryTimeSlot}</p>
      </div>

      <div className="rounded-xl border border-forest-700 bg-forest-800 p-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-forest-300">Zamówienie</h3>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span className="text-cream">{item.name} × {item.quantity}</span>
              <span className="text-accent">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-forest-700 pt-4">
          <div className="flex justify-between text-sm text-forest-300"><span>Suma częściowa</span><span>{formatPrice(subtotal)}</span></div>
          <div className="flex justify-between text-sm text-forest-300"><span>Dostawa</span><span>{deliveryFee === 0 ? 'Darmowa' : formatPrice(deliveryFee)}</span></div>
          <div className="flex justify-between text-lg font-bold"><span className="text-cream">Razem</span><span className="text-accent">{formatPrice(total)}</span></div>
        </div>
      </div>

      <div className="rounded-xl border border-forest-700 bg-forest-800 p-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-forest-300">Metoda płatności online</h3>
        <div className="space-y-2">
          {([
            { value: 'p24' as const, label: 'Przelewy24' },
            { value: 'dotpay' as const, label: 'Dotpay' },
          ]).map((option) => (
            <label key={option.value} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${paymentMethod === option.value ? 'border-accent bg-accent/10' : 'border-forest-600 bg-forest-700 hover:border-forest-500'}`}>
              <input type="radio" name="payment" value={option.value} checked={paymentMethod === option.value} onChange={() => onPaymentChange(option.value)} className="accent-accent" />
              <span className="text-cream">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="rounded-lg border border-forest-600 px-6 py-3 text-forest-300 transition hover:bg-forest-700">← Wstecz</button>
        <button onClick={handleOrder} disabled={loading} className="rounded-lg bg-accent px-8 py-3.5 text-base font-bold text-forest-950 transition hover:bg-accent-light disabled:opacity-50">
          {loading ? 'Przekierowanie do płatności...' : 'Przejdź do płatności'}
        </button>
      </div>
    </div>
  )
}
