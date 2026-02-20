'use client'

import { useState } from 'react'
import { checkoutContactSchema, type CheckoutContact } from '@/lib/validators'

const inputClass = 'w-full rounded-lg border border-forest-600 bg-forest-700 px-4 py-3 text-cream placeholder:text-forest-400 focus:border-accent focus:ring-1 focus:ring-accent/20 focus:outline-none'

interface StepContactProps {
  data: CheckoutContact
  onNext: (data: CheckoutContact) => void
}

export function StepContact({ data, onNext }: StepContactProps) {
  const [form, setForm] = useState(data)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    const result = checkoutContactSchema.safeParse(form)
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
      <h2 className="mb-6 text-xl font-bold text-cream">Dane kontaktowe</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-cream">Imię i nazwisko *</label>
          <input type="text" value={form.name} onChange={e => update('name', e.target.value)} className={inputClass} placeholder="Jan Kowalski" />
          {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-cream">Email *</label>
          <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className={inputClass} placeholder="jan@example.com" />
          {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-cream">Telefon *</label>
          <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} className={inputClass} placeholder="+48 123 456 789" />
          {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-cream">Firma (opcjonalnie)</label>
          <input type="text" value={form.company || ''} onChange={e => update('company', e.target.value)} className={inputClass} placeholder="Nazwa firmy" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-cream">NIP (opcjonalnie)</label>
          <input type="text" value={form.nip || ''} onChange={e => update('nip', e.target.value)} className={inputClass} placeholder="1234567890" />
          {errors.nip && <p className="mt-1 text-sm text-red-400">{errors.nip}</p>}
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <button onClick={handleSubmit} className="rounded-lg bg-accent px-8 py-3 font-semibold text-forest-950 transition hover:bg-accent-light">
          Dalej →
        </button>
      </div>
    </div>
  )
}
