'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { AnimatedSection, AnimatedItem } from '@/components/ui/AnimatedSection'

const eventTypes = [
  { label: 'Wybierz typ wydarzenia', value: '' },
  { label: 'Catering firmowy', value: 'catering-firmowy' },
  { label: 'Wesele', value: 'wesele' },
  { label: 'Event prywatny', value: 'event-prywatny' },
  { label: 'Obsługa baru', value: 'bar' },
  { label: 'Catering + Bar', value: 'catering-plus-bar' },
  { label: 'Inne', value: 'inne' },
]

const contactCards = [
  { emoji: '📍', title: 'Adres', content: 'ul. Leśna 42\n70-001 Szczecin' },
  { emoji: '📞', title: 'Telefon', content: '+48 123 456 789', href: 'tel:+48123456789' },
  { emoji: '✉️', title: 'Email', content: 'kontakt@forestcatering.pl', href: 'mailto:kontakt@forestcatering.pl' },
  { emoji: '🕐', title: 'Godziny otwarcia', content: 'Pon-Pt: 8:00-18:00\nSob: 9:00-14:00' },
]

export default function KontaktPage() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    guestCount: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const eventParam = searchParams.get('event')
    if (eventParam) {
      setFormData((prev) => ({ ...prev, eventType: eventParam }))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error')
      setErrorMsg('Wypełnij wymagane pola: imię, email i wiadomość.')
      return
    }

    setStatus('loading')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          eventType: formData.eventType || undefined,
          eventDate: formData.eventDate || undefined,
          guestCount: formData.guestCount ? Number(formData.guestCount) : undefined,
          message: formData.message,
          source: 'contact-form',
        }),
      })
      if (!res.ok) throw new Error('Błąd serwera')
      setStatus('success')
      setFormData({ name: '', email: '', phone: '', eventType: '', eventDate: '', guestCount: '', message: '' })
    } catch {
      setStatus('error')
      setErrorMsg('Wystąpił błąd. Spróbuj ponownie lub zadzwoń do nas.')
    }
  }

  const inputClass = 'w-full rounded-lg border border-forest-600 bg-forest-700 px-4 py-3 text-cream placeholder:text-forest-400 focus:border-accent focus:ring-1 focus:ring-accent/20 focus:outline-none'

  return (
    <div className="min-h-screen bg-forest-900 pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4">
        <AnimatedSection>
          <h1 className="text-3xl font-bold text-cream md:text-5xl">Kontakt</h1>
          <div className="mt-2 h-1 w-16 rounded bg-accent" />
          <p className="mt-4 text-lg text-forest-200">Napisz do nas — odpowiemy w ciągu 24h</p>
        </AnimatedSection>

        <div className="mt-12 grid gap-10 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3">
            <AnimatedSection>
              <form onSubmit={handleSubmit} className="rounded-xl border border-forest-700 bg-forest-800 p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-cream">Imię i nazwisko *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClass}
                      placeholder="Jan Kowalski"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-cream">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClass}
                      placeholder="jan@example.com"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-cream">Telefon</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={inputClass}
                      placeholder="+48 000 000 000"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-cream">Typ wydarzenia</label>
                    <select
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className={inputClass}
                    >
                      {eventTypes.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-cream">Data wydarzenia</label>
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-cream">Liczba gości</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.guestCount}
                      onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                      className={inputClass}
                      placeholder="np. 50"
                    />
                  </div>
                </div>
                <div className="mt-5">
                  <label className="mb-1 block text-sm font-medium text-cream">Wiadomość *</label>
                  <textarea
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={inputClass}
                    placeholder="Opisz swoje potrzeby..."
                  />
                </div>

                {status === 'success' && (
                  <div className="mt-4 rounded-lg bg-green-900/50 p-3 text-sm text-green-200">
                    Dziękujemy! Odpowiemy w ciągu 24h. ✓
                  </div>
                )}
                {status === 'error' && (
                  <div className="mt-4 rounded-lg bg-red-900/50 p-3 text-sm text-red-200">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="mt-6 w-full rounded-lg bg-accent py-3.5 text-base font-semibold text-forest-950 transition hover:bg-accent-light disabled:opacity-50"
                >
                  {status === 'loading' ? 'Wysyłanie...' : 'Wyślij wiadomość'}
                </button>
              </form>
            </AnimatedSection>
          </div>

          {/* Contact cards */}
          <div className="lg:col-span-2">
            <AnimatedSection stagger>
              <div className="space-y-4">
                {contactCards.map((card) => (
                  <AnimatedItem key={card.title}>
                    <div className="rounded-xl border border-forest-700 bg-forest-800 p-6">
                      <div className="flex items-start gap-4">
                        <span className="text-2xl">{card.emoji}</span>
                        <div>
                          <h3 className="font-semibold text-cream">{card.title}</h3>
                          {card.href ? (
                            <a href={card.href} className="mt-1 block text-sm text-forest-300 transition hover:text-accent whitespace-pre-line">
                              {card.content}
                            </a>
                          ) : (
                            <p className="mt-1 text-sm text-forest-300 whitespace-pre-line">{card.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </AnimatedItem>
                ))}
                <AnimatedItem>
                  <div className="rounded-xl border border-forest-700 bg-forest-800 p-6">
                    <p className="text-sm text-forest-300">
                      📍 Lokalizacja: Szczecin, woj. zachodniopomorskie
                    </p>
                  </div>
                </AnimatedItem>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  )
}
