'use client'

import { useState, useCallback, useEffect } from 'react'
import type { AiSuggestResponse, AiSuggestion } from '@/lib/ai-content-engine'

type Tone = 'professional' | 'friendly' | 'luxury'

const TONES: { key: Tone; label: string }[] = [
  { key: 'professional', label: 'Profesjonalny' },
  { key: 'friendly', label: 'Przyjazny' },
  { key: 'luxury', label: 'Premium' },
]

interface AiSuggestPopoverProps {
  blockType: string
  fieldPath: string
  onApply: (value: string) => void
  onClose: () => void
}

export function AiSuggestPopover({ blockType, fieldPath, onApply, onClose }: AiSuggestPopoverProps) {
  const [tone, setTone] = useState<Tone>('professional')
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSuggestions = useCallback(async (selectedTone: Tone) => {
    setLoading(true)
    setError(null)
    setSuggestions([])
    try {
      const res = await fetch('/api/page-editor/ai-suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-editor-secret': process.env.NEXT_PUBLIC_EDITOR_SECRET ?? '',
        },
        body: JSON.stringify({ blockType, fieldPath, tone: selectedTone }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as AiSuggestResponse
      if (data.suggestions.length === 0) {
        setError('Brak sugestii — spróbuj innego tonu')
      } else {
        setSuggestions(data.suggestions)
      }
    } catch {
      setError('Brak sugestii — spróbuj innego tonu')
    } finally {
      setLoading(false)
    }
  }, [blockType, fieldPath])

  const handleToneChange = (newTone: Tone) => {
    setTone(newTone)
    void fetchSuggestions(newTone)
  }

  const handleGenerate = () => {
    void fetchSuggestions(tone)
  }

  // Auto-fetch on mount
  useEffect(() => {
    void fetchSuggestions(tone)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time init
  }, [])

  return (
    <div className="absolute left-0 top-full z-50 mt-1 w-80 rounded-lg border border-forest-700 bg-forest-900 p-3 shadow-xl">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-cream">✨ Sugestie AI</span>
        <button
          onClick={onClose}
          className="rounded p-0.5 text-forest-400 transition hover:bg-forest-800 hover:text-cream"
          aria-label="Zamknij"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tone tabs */}
      <div className="mb-3 flex gap-0.5 rounded-md bg-forest-800 p-0.5" role="radiogroup" aria-label="Ton">
        {TONES.map(({ key, label }) => (
          <button
            key={key}
            role="radio"
            aria-checked={tone === key}
            onClick={() => handleToneChange(key)}
            className={`flex-1 rounded px-2 py-1 text-[10px] font-medium transition ${
              tone === key
                ? 'bg-accent text-forest-950'
                : 'text-forest-400 hover:text-cream'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span className="ml-2 text-xs text-forest-400">Generowanie…</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <p className="py-2 text-center text-xs text-orange-400">{error}</p>
      )}

      {/* Suggestions list */}
      {!loading && suggestions.length > 0 && (
        <ul className="space-y-1.5">
          {suggestions.map((s, i) => (
            <li key={i} className="flex items-start gap-2 rounded-md bg-forest-800/50 p-2">
              <p className="flex-1 text-xs leading-relaxed text-cream/90">{s.text}</p>
              <button
                onClick={() => {
                  onApply(s.text)
                  onClose()
                }}
                className="shrink-0 rounded bg-accent px-2 py-0.5 text-[10px] font-medium text-forest-950 transition hover:bg-accent-light"
              >
                Użyj
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Generate new */}
      {!loading && (
        <button
          onClick={handleGenerate}
          className="mt-2 w-full rounded-md bg-forest-800 py-1.5 text-xs text-forest-300 transition hover:bg-forest-700 hover:text-cream"
        >
          🔄 Generuj nowe
        </button>
      )}
    </div>
  )
}
