'use client'

import { useState, useEffect, useCallback } from 'react'
import { labelClasses, inputClasses } from './field-primitives'

interface MediaDoc {
  id: number
  alt?: string
  url?: string
  thumbnailURL?: string
  filename?: string
  sizes?: Record<string, { url?: string }>
}

function getThumbnail(doc: MediaDoc): string {
  if (doc.thumbnailURL) return doc.thumbnailURL
  if (doc.sizes?.thumbnail?.url) return doc.sizes.thumbnail.url
  return doc.url ?? ''
}

export function FieldMediaPicker({
  label,
  value,
  onSelect,
}: {
  label: string
  value: number | null
  onSelect: (mediaId: number | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [docs, setDocs] = useState<MediaDoc[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<MediaDoc | null>(null)

  const fetchMedia = useCallback(async (searchTerm: string) => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/page-editor/media?search=${encodeURIComponent(searchTerm)}`,
        { headers: { 'x-editor-secret': process.env.NEXT_PUBLIC_EDITOR_SECRET ?? '' } },
      )
      if (res.ok) {
        const data = await res.json()
        setDocs(data.docs ?? [])
      }
    } catch {
      // ignore fetch errors
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch selected media preview
  useEffect(() => {
    if (value === null) {
      setSelected(null)
      return
    }
    // Try to find in already-loaded docs
    const found = docs.find((d) => d.id === value)
    if (found) {
      setSelected(found)
      return
    }
    // Fetch all to find the selected one
    void fetchMedia('')
  }, [value, docs, fetchMedia])

  // Resolve selected from docs when docs change
  useEffect(() => {
    if (value !== null && !selected) {
      const found = docs.find((d) => d.id === value)
      if (found) setSelected(found)
    }
  }, [docs, value, selected])

  // Fetch when dropdown opens or search changes
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => fetchMedia(search), 300)
      return () => clearTimeout(timer)
    }
  }, [open, search, fetchMedia])

  return (
    <div className="space-y-1">
      <span className={labelClasses}>{label}</span>

      {/* Current preview */}
      {selected && (
        <div className="flex items-center gap-2 rounded-lg border border-forest-700 bg-forest-800/50 p-2">
          <img
            src={getThumbnail(selected)}
            alt={selected.alt ?? selected.filename ?? ''}
            className="h-10 w-10 rounded object-cover"
          />
          <span className="flex-1 truncate text-xs text-cream">
            {selected.filename ?? `#${selected.id}`}
          </span>
          <button
            type="button"
            onClick={() => {
              onSelect(null)
              setSelected(null)
            }}
            className="text-xs text-forest-500 hover:text-red-400"
          >
            Usuń
          </button>
        </div>
      )}

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded-lg border border-dashed border-forest-600 px-3 py-2 text-xs text-forest-400 hover:border-accent hover:text-accent transition"
      >
        {open ? '✕ Zamknij' : '🖼️ Wybierz obraz'}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="rounded-lg border border-forest-700 bg-forest-800 p-2 space-y-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj zdjęcia…"
            className={inputClasses}
          />

          {loading && (
            <p className="text-xs text-forest-500 text-center py-2">Ładowanie…</p>
          )}

          {!loading && docs.length === 0 && (
            <p className="text-xs text-forest-500 italic text-center py-2">Brak zdjęć</p>
          )}

          {!loading && docs.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
              {docs.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => {
                    onSelect(doc.id)
                    setSelected(doc)
                    setOpen(false)
                  }}
                  className={`relative rounded border overflow-hidden aspect-square ${
                    value === doc.id
                      ? 'border-accent ring-1 ring-accent'
                      : 'border-forest-700 hover:border-accent'
                  }`}
                >
                  <img
                    src={getThumbnail(doc)}
                    alt={doc.alt ?? doc.filename ?? ''}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
