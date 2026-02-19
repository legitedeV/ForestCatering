'use client'

import { useState } from 'react'
import { checkoutDeliverySchema, getMinDeliveryDate, type CheckoutDelivery } from '@/lib/validators'

const inputClass = 'w-full rounded-lg border border-forest-600 bg-forest-700 px-4 py-3 text-cream placeholder:text-forest-400 focus:border-accent focus:ring-1 focus:ring-accent/20 focus:outline-none'

const timeSlots = [
  '8:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00',
] as const

interface StepDeliveryProps {
  data: CheckoutDelivery
  onNext: (data: CheckoutDelivery) => void
  onBack: () => void
}

export function StepDelivery({ data, onNext, onBack }: StepDeliveryProps) {
  const [form, setForm] = useState(data)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    const result = checkoutDeliverySchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    onNext(result.data)
  }

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-forest-700 bg-forest-800 p-8">
      <h2 className="mb-6 text-xl font-bold text-cream">Adres dostawy</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-cream">Ulica i numer *</label>
          <input type="text" value={form.street} onChange={e => update('street', e.target.value)} className={inputClass} placeholder="ul. Przykładowa 10/2" />
          {errors.street && <p className="mt-1 text-sm text-red-400">{errors.street}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-cream">Miasto *</label>
          <input type="text" value={form.city} onChange={e => update('city', e.target.value)} className={inputClass} placeholder="Szczecin" />
          {errors.city && <p className="mt-1 text-sm text-red-400">{errors.city}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-cream">Kod pocztowy *</label>
          <input type="text" value={form.postalCode} onChange={e => update('postalCode', e.target.value)} className={inputClass} placeholder="70-001" />
          {errors.postalCode && <p className="mt-1 text-sm text-red-400">{errors.postalCode}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-cream">Data dostawy *</label>
          <input type="date" value={form.deliveryDate} onChange={e => update('deliveryDate', e.target.value)} min={getMinDeliveryDate()} className={inputClass} />
          {errors.deliveryDate && <p className="mt-1 text-sm text-red-400">{errors.deliveryDate}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-cream">Godzina dostawy *</label>
          <select value={form.deliveryTimeSlot} onChange={e => update('deliveryTimeSlot', e.target.value)} className={inputClass}>
            <option value="">Wybierz przedział</option>
            {timeSlots.map(slot => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
          {errors.deliveryTimeSlot && <p className="mt-1 text-sm text-red-400">{errors.deliveryTimeSlot}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-cream">Uwagi do dostawy (opcjonalnie)</label>
          <textarea rows={3} value={form.notes || ''} onChange={e => update('notes', e.target.value)} className={inputClass} placeholder="Np. kod do bramy, piętro..." />
        </div>
      </div>
      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="rounded-lg border border-forest-600 px-6 py-3 text-forest-300 transition hover:bg-forest-700">
          ← Wstecz
        </button>
        <button onClick={handleSubmit} className="rounded-lg bg-accent px-8 py-3 font-semibold text-forest-950 transition hover:bg-accent-light">
          Dalej →
        </button>
      </div>
    </div>
  )
}
