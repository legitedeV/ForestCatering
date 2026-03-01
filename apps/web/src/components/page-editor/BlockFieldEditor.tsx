'use client'

import { useRef, useCallback, useEffect } from 'react'
import { usePageEditor } from '@/lib/page-editor-store'
import { getBlockMeta } from '@/lib/block-metadata'
import type { PageSection } from '@/components/cms/types'

// ────────────────────────────────────────────────────────
// Pomocnicze komponenty pól
// ────────────────────────────────────────────────────────

const inputClasses =
  'w-full rounded-lg bg-forest-800 border border-forest-700 px-3 py-2 text-sm text-cream placeholder:text-forest-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent'
const labelClasses = 'block text-xs font-medium uppercase tracking-wider text-forest-400 mb-1'

function FieldText({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <label className="block">
      <span className={labelClasses}>{label}</span>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={inputClasses}
      />
    </label>
  )
}

function FieldTextarea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="block">
      <span className={labelClasses}>{label}</span>
      <textarea
        rows={3}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={inputClasses + ' resize-y'}
      />
    </label>
  )
}

function FieldNumber({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <label className="block">
      <span className={labelClasses}>{label}</span>
      <input
        type="number"
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
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

  // Debounce z useRef + setTimeout
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // Czyszczenie timerów przy odmontowaniu
  useEffect(() => {
    const timers = timersRef.current
    return () => {
      Object.values(timers).forEach(clearTimeout)
    }
  }, [])

  const debouncedUpdate = useCallback(
    (index: number, fieldPath: string, value: unknown) => {
      const key = `${index}:${fieldPath}`
      if (timersRef.current[key]) clearTimeout(timersRef.current[key])
      timersRef.current[key] = setTimeout(() => {
        updateBlockField(index, fieldPath, value)
        delete timersRef.current[key]
      }, 300)
    },
    [updateBlockField],
  )

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

  // Skrót do tworzenia onChange z debounce
  const onChange = (field: string) => (val: unknown) => debouncedUpdate(idx, field, val)

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
            <FieldText label="Nagłówek" value={v('heading')} onChange={onChange('heading')} />
            <FieldTextarea label="Podnagłówek" value={v('subheading')} onChange={onChange('subheading')} />
            <FieldText label="Tekst CTA" value={v('ctaText')} onChange={onChange('ctaText')} />
            <FieldText label="Link CTA" value={v('ctaLink')} onChange={onChange('ctaLink')} />
            <FieldText label="Badge" value={v('badge')} onChange={onChange('badge')} />
            <FieldText label="Drugi CTA tekst" value={v('secondaryCtaText')} onChange={onChange('secondaryCtaText')} />
            <FieldText label="Drugi CTA link" value={v('secondaryCtaLink')} onChange={onChange('secondaryCtaLink')} />
            <FieldToggle label="Pełna wysokość" checked={vBool('fullHeight')} onChange={onChange('fullHeight')} />
            <FieldToggle label="Wskaźnik przewijania" checked={vBool('showScrollIndicator')} onChange={onChange('showScrollIndicator')} />
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
            <FieldText label="Nagłówek" value={v('heading')} onChange={onChange('heading')} />
            <PayloadAdminLink label="Edytuj usługi (items) w Payload Admin" pageId={pageId} />
          </>
        )}

        {block.blockType === 'cta' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onChange={onChange('heading')} />
            <FieldTextarea label="Tekst" value={v('text')} onChange={onChange('text')} />
            <FieldText label="Tekst przycisku" value={v('buttonText')} onChange={onChange('buttonText')} />
            <FieldText label="Link przycisku" value={v('buttonLink')} onChange={onChange('buttonLink')} />
          </>
        )}

        {block.blockType === 'faq' && (
          <PayloadAdminLink label="Edytuj pytania w Payload Admin" pageId={pageId} />
        )}

        {block.blockType === 'testimonials' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onChange={onChange('heading')} />
            <PayloadAdminLink label="Edytuj opinie (items) w Payload Admin" pageId={pageId} />
          </>
        )}

        {block.blockType === 'pricing' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onChange={onChange('heading')} />
            <FieldTextarea label="Podnagłówek" value={v('subheading')} onChange={onChange('subheading')} />
            <PayloadAdminLink label="Edytuj pakiety w Payload Admin" pageId={pageId} />
          </>
        )}

        {block.blockType === 'steps' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onChange={onChange('heading')} />
            <PayloadAdminLink label="Edytuj kroki w Payload Admin" pageId={pageId} />
          </>
        )}

        {block.blockType === 'contactForm' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onChange={onChange('heading')} />
            <FieldTextarea label="Podnagłówek" value={v('subheading')} onChange={onChange('subheading')} />
          </>
        )}

        {block.blockType === 'legalText' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onChange={onChange('heading')} />
            <FieldText label="Data obowiązywania" value={v('effectiveDate')} onChange={onChange('effectiveDate')} type="date" />
          </>
        )}

        {block.blockType === 'partners' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onChange={onChange('heading')} />
            <FieldSelect
              label="Wariant"
              value={v('variant') || 'grid'}
              options={[
                { value: 'grid', label: 'Siatka' },
                { value: 'carousel', label: 'Karuzela' },
              ]}
              onChange={onChange('variant')}
            />
            <FieldToggle label="Szarość (grayscale)" checked={vBool('grayscale')} onChange={onChange('grayscale')} />
          </>
        )}

        {block.blockType === 'team' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onChange={onChange('heading')} />
          </>
        )}

        {block.blockType === 'mapArea' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onChange={onChange('heading')} />
            <FieldTextarea label="Opis" value={v('description')} onChange={onChange('description')} />
            <FieldText label="URL mapy (embed)" value={v('embedUrl')} onChange={onChange('embedUrl')} />
            <FieldText label="Notatka" value={v('note')} onChange={onChange('note')} />
          </>
        )}

        {block.blockType === 'offerCards' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onChange={onChange('heading')} />
            <PayloadAdminLink label="Edytuj karty w Payload Admin" pageId={pageId} />
          </>
        )}

        {block.blockType === 'featuredProducts' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onChange={onChange('heading')} />
            <FieldNumber label="Limit produktów" value={vNum('limit')} onChange={onChange('limit')} />
            <FieldText label="Tekst linku" value={v('linkText')} onChange={onChange('linkText')} />
            <FieldText label="URL linku" value={v('linkUrl')} onChange={onChange('linkUrl')} />
          </>
        )}

        {block.blockType === 'about' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onChange={onChange('heading')} />
            <FieldText label="Badge" value={v('badge')} onChange={onChange('badge')} />
            <FieldText label="Tekst CTA" value={v('ctaText')} onChange={onChange('ctaText')} />
            <FieldText label="Link CTA" value={v('ctaLink')} onChange={onChange('ctaLink')} />
          </>
        )}

        {block.blockType === 'gallery' && (
          <PayloadAdminLink label="Edytuj zdjęcia w Payload Admin" pageId={pageId} />
        )}

        {block.blockType === 'galleryFull' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onChange={onChange('heading')} />
            <PayloadAdminLink label="Edytuj pozycje galerii w Payload Admin" pageId={pageId} />
          </>
        )}
      </div>
    </div>
  )
}
