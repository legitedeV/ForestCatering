'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { usePageEditor } from '@/lib/page-editor-store'
import { getBlockMeta } from '@/lib/block-metadata'
import type { PageSection } from '@/components/cms/types'

// ────────────────────────────────────────────────────────
// Hook: optimistic local state z debounced commit
// ────────────────────────────────────────────────────────

function useLocalField<T>(storeValue: T, commitFn: (v: T) => void, delay = 400) {
  const [localValue, setLocalValue] = useState(storeValue)
  const commitRef = useRef(commitFn)
  commitRef.current = commitFn
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Sync z zewnątrz (np. undo, load)
  useEffect(() => {
    setLocalValue(storeValue)
  }, [storeValue])

  const handleChange = useCallback(
    (newVal: T) => {
      setLocalValue(newVal)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        commitRef.current(newVal)
      }, delay)
    },
    [delay],
  )

  const localRef = useRef(storeValue)
  localRef.current = localValue

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        commitRef.current(localRef.current)
      }
    }
  }, [])

  return [localValue, handleChange] as const
}

// ────────────────────────────────────────────────────────
// Pomocnicze komponenty pól
// ────────────────────────────────────────────────────────

const inputClasses =
  'w-full rounded-lg bg-forest-800 border border-forest-700 px-3 py-2 text-sm text-cream placeholder:text-forest-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent'
const labelClasses = 'block text-xs font-medium uppercase tracking-wider text-forest-400 mb-1'

function FieldText({
  label,
  value,
  onCommit,
  type = 'text',
}: {
  label: string
  value: string
  onCommit: (v: string) => void
  type?: string
}) {
  const [local, setLocal] = useLocalField(value ?? '', onCommit)
  return (
    <label className="block">
      <span className={labelClasses}>{label}</span>
      <input
        type={type}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        className={inputClasses}
      />
    </label>
  )
}

function FieldTextarea({
  label,
  value,
  onCommit,
}: {
  label: string
  value: string
  onCommit: (v: string) => void
}) {
  const [local, setLocal] = useLocalField(value ?? '', onCommit)
  return (
    <label className="block">
      <span className={labelClasses}>{label}</span>
      <textarea
        rows={3}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        className={inputClasses + ' resize-y'}
      />
    </label>
  )
}

function FieldNumber({
  label,
  value,
  onCommit,
}: {
  label: string
  value: number
  onCommit: (v: number) => void
}) {
  const [local, setLocal] = useLocalField(value ?? 0, onCommit)
  return (
    <label className="block">
      <span className={labelClasses}>{label}</span>
      <input
        type="number"
        value={local}
        onChange={(e) => setLocal(Number(e.target.value))}
        className={inputClasses}
      />
    </label>
  )
}

function FieldToggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-2">
      <span className={labelClasses + ' mb-0'}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${
          checked ? 'bg-accent' : 'bg-forest-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-cream transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}

function FieldSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (v: string) => void
}) {
  return (
    <label className="block">
      <span className={labelClasses}>{label}</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={inputClasses}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function PayloadAdminLink({ label, pageId }: { label: string; pageId: number | null }) {
  return (
    <div className="rounded-lg border border-forest-700 bg-forest-800/50 p-3">
      <p className="text-xs text-forest-400">{label}</p>
      {pageId && (
        <a
          href={`/admin/collections/pages/${pageId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-xs font-medium text-accent hover:text-accent-light"
        >
          Otwórz w Payload Admin →
        </a>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────
// Główny komponent
// ────────────────────────────────────────────────────────

export function BlockFieldEditor() {
  const selectedBlockIndex = usePageEditor((s) => s.selectedBlockIndex)
  const sections = usePageEditor((s) => s.sections)
  const updateBlockField = usePageEditor((s) => s.updateBlockField)
  const pageId = usePageEditor((s) => s.pageId)

  if (selectedBlockIndex === null || !sections[selectedBlockIndex]) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <span className="text-3xl">👆</span>
        <p className="mt-2 text-sm text-forest-400">Wybierz sekcję do edycji</p>
      </div>
    )
  }

  const block = sections[selectedBlockIndex] as PageSection & Record<string, unknown>
  const meta = getBlockMeta(block.blockType)
  const idx = selectedBlockIndex

  // Pomocnik do odczytu pola bloku
  const v = (field: string) => (block[field] as string) ?? ''
  const vNum = (field: string) => (typeof block[field] === 'number' ? (block[field] as number) : 0)
  const vBool = (field: string) => !!(block[field] as boolean)

  // Skrót do tworzenia commit callback
  const onCommit = (field: string) => (val: unknown) => updateBlockField(idx, field, val)

  return (
    <div className="space-y-4 p-3">
      {/* Nagłówek */}
      <div className="flex items-center gap-2 border-b border-forest-700 pb-3">
        <span className="text-xl">{meta?.icon ?? '📦'}</span>
        <div>
          <p className="text-sm font-semibold text-cream">{meta?.label ?? block.blockType}</p>
          <p className="text-xs text-forest-500">Sekcja #{idx + 1}</p>
        </div>
      </div>

      {/* Pola wg blockType */}
      <div className="space-y-3">
        {block.blockType === 'hero' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
            <FieldTextarea label="Podnagłówek" value={v('subheading')} onCommit={onCommit('subheading')} />
            <FieldText label="Tekst CTA" value={v('ctaText')} onCommit={onCommit('ctaText')} />
            <FieldText label="Link CTA" value={v('ctaLink')} onCommit={onCommit('ctaLink')} />
            <FieldText label="Badge" value={v('badge')} onCommit={onCommit('badge')} />
            <FieldText label="Drugi CTA tekst" value={v('secondaryCtaText')} onCommit={onCommit('secondaryCtaText')} />
            <FieldText label="Drugi CTA link" value={v('secondaryCtaLink')} onCommit={onCommit('secondaryCtaLink')} />
            <FieldToggle label="Pełna wysokość" checked={vBool('fullHeight')} onChange={onCommit('fullHeight')} />
            <FieldToggle label="Wskaźnik przewijania" checked={vBool('showScrollIndicator')} onChange={onCommit('showScrollIndicator')} />
          </>
        )}

        {block.blockType === 'richText' && (
          <PayloadAdminLink label="Edytuj tekst w Payload Admin" pageId={pageId} />
        )}

        {block.blockType === 'stats' && (
          <PayloadAdminLink label="Edytuj items w Payload Admin" pageId={pageId} />
        )}

        {block.blockType === 'services' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
            <PayloadAdminLink label="Edytuj usługi (items) w Payload Admin" pageId={pageId} />
          </>
        )}

        {block.blockType === 'cta' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
            <FieldTextarea label="Tekst" value={v('text')} onCommit={onCommit('text')} />
            <FieldText label="Tekst przycisku" value={v('buttonText')} onCommit={onCommit('buttonText')} />
            <FieldText label="Link przycisku" value={v('buttonLink')} onCommit={onCommit('buttonLink')} />
          </>
        )}

        {block.blockType === 'faq' && (
          <PayloadAdminLink label="Edytuj pytania w Payload Admin" pageId={pageId} />
        )}

        {block.blockType === 'testimonials' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
            <PayloadAdminLink label="Edytuj opinie (items) w Payload Admin" pageId={pageId} />
          </>
        )}

        {block.blockType === 'pricing' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
            <FieldTextarea label="Podnagłówek" value={v('subheading')} onCommit={onCommit('subheading')} />
            <PayloadAdminLink label="Edytuj pakiety w Payload Admin" pageId={pageId} />
          </>
        )}

        {block.blockType === 'steps' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
            <PayloadAdminLink label="Edytuj kroki w Payload Admin" pageId={pageId} />
          </>
        )}

        {block.blockType === 'contactForm' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
            <FieldTextarea label="Podnagłówek" value={v('subheading')} onCommit={onCommit('subheading')} />
          </>
        )}

        {block.blockType === 'legalText' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
            <FieldText label="Data obowiązywania" value={v('effectiveDate')} onCommit={onCommit('effectiveDate')} type="date" />
          </>
        )}

        {block.blockType === 'partners' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
            <FieldSelect
              label="Wariant"
              value={v('variant') || 'grid'}
              options={[
                { value: 'grid', label: 'Siatka' },
                { value: 'carousel', label: 'Karuzela' },
              ]}
              onChange={onCommit('variant')}
            />
            <FieldToggle label="Szarość (grayscale)" checked={vBool('grayscale')} onChange={onCommit('grayscale')} />
          </>
        )}

        {block.blockType === 'team' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
          </>
        )}

        {block.blockType === 'mapArea' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
            <FieldTextarea label="Opis" value={v('description')} onCommit={onCommit('description')} />
            <FieldText label="URL mapy (embed)" value={v('embedUrl')} onCommit={onCommit('embedUrl')} />
            <FieldText label="Notatka" value={v('note')} onCommit={onCommit('note')} />
          </>
        )}

        {block.blockType === 'offerCards' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
            <PayloadAdminLink label="Edytuj karty w Payload Admin" pageId={pageId} />
          </>
        )}

        {block.blockType === 'featuredProducts' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
            <FieldNumber label="Limit produktów" value={vNum('limit')} onCommit={onCommit('limit')} />
            <FieldText label="Tekst linku" value={v('linkText')} onCommit={onCommit('linkText')} />
            <FieldText label="URL linku" value={v('linkUrl')} onCommit={onCommit('linkUrl')} />
          </>
        )}

        {block.blockType === 'about' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
            <FieldText label="Badge" value={v('badge')} onCommit={onCommit('badge')} />
            <FieldText label="Tekst CTA" value={v('ctaText')} onCommit={onCommit('ctaText')} />
            <FieldText label="Link CTA" value={v('ctaLink')} onCommit={onCommit('ctaLink')} />
          </>
        )}

        {block.blockType === 'gallery' && (
          <PayloadAdminLink label="Edytuj zdjęcia w Payload Admin" pageId={pageId} />
        )}

        {block.blockType === 'galleryFull' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
            <PayloadAdminLink label="Edytuj pozycje galerii w Payload Admin" pageId={pageId} />
          </>
        )}
      </div>
    </div>
  )
}
