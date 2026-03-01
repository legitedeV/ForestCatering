'use client'

import { usePageEditor } from '@/lib/page-editor-store'
import { getBlockMeta } from '@/lib/block-metadata'
import type { PageSection } from '@/components/cms/types'
import {
  FieldText,
  FieldTextarea,
  FieldNumber,
  FieldToggle,
  FieldSelect,
} from './field-primitives'
import { FieldArrayEditor } from './FieldArrayEditor'
import type { ArrayFieldConfig } from './FieldArrayEditor'
import { FieldMediaPicker } from './FieldMediaPicker'

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
// Array field configs per block type
// ────────────────────────────────────────────────────────

const ARRAY_CONFIGS: Record<string, ArrayFieldConfig> = {
  faq: {
    name: 'items',
    label: 'Pytania FAQ',
    itemLabel: 'Pytanie',
    maxItems: 12,
    fields: [
      { key: 'question', label: 'Pytanie', type: 'text' },
      { key: 'answer', label: 'Odpowiedź', type: 'textarea' },
    ],
  },
  steps: {
    name: 'steps',
    label: 'Kroki',
    itemLabel: 'Krok',
    maxItems: 10,
    fields: [
      { key: 'emoji', label: 'Emoji', type: 'text' },
      { key: 'title', label: 'Tytuł', type: 'text' },
      { key: 'description', label: 'Opis', type: 'textarea' },
    ],
  },
  pricing: {
    name: 'packages',
    label: 'Pakiety',
    itemLabel: 'Pakiet',
    maxItems: 12,
    fields: [
      { key: 'name', label: 'Nazwa', type: 'text' },
      { key: 'price', label: 'Cena', type: 'text' },
      { key: 'ctaText', label: 'Tekst CTA', type: 'text' },
      { key: 'ctaLink', label: 'Link CTA', type: 'text' },
      { key: 'featured', label: 'Wyróżniony', type: 'toggle' },
      { key: 'features', label: 'Cechy', type: 'array', arrayConfig: {
        name: 'features',
        label: 'Cechy pakietu',
        itemLabel: 'Cecha',
        fields: [{ key: 'text', label: 'Treść', type: 'text' }],
      }},
    ],
  },
  services: {
    name: 'items',
    label: 'Usługi',
    itemLabel: 'Usługa',
    maxItems: 8,
    fields: [
      { key: 'emoji', label: 'Emoji', type: 'text' },
      { key: 'title', label: 'Tytuł', type: 'text' },
      { key: 'description', label: 'Opis', type: 'textarea' },
      { key: 'link', label: 'Link', type: 'text' },
    ],
  },
  testimonials: {
    name: 'items',
    label: 'Opinie',
    itemLabel: 'Opinia',
    fields: [
      { key: 'quote', label: 'Cytat', type: 'textarea' },
      { key: 'author', label: 'Autor', type: 'text' },
      { key: 'event', label: 'Wydarzenie', type: 'text' },
      { key: 'rating', label: 'Ocena (1-5)', type: 'number' },
    ],
  },
  offerCards: {
    name: 'cards',
    label: 'Karty ofertowe',
    itemLabel: 'Karta',
    fields: [
      { key: 'title', label: 'Tytuł', type: 'text' },
      { key: 'priceFrom', label: 'Cena od', type: 'text' },
      { key: 'badge', label: 'Badge', type: 'text' },
      { key: 'featured', label: 'Wyróżniona', type: 'toggle' },
      { key: 'ctaText', label: 'Tekst CTA', type: 'text' },
      { key: 'ctaLink', label: 'Link CTA', type: 'text' },
      { key: 'features', label: 'Cechy', type: 'array', arrayConfig: {
        name: 'features',
        label: 'Cechy karty',
        itemLabel: 'Cecha',
        fields: [{ key: 'text', label: 'Treść', type: 'text' }],
      }},
    ],
  },
  stats: {
    name: 'items',
    label: 'Statystyki',
    itemLabel: 'Statystyka',
    fields: [
      { key: 'value', label: 'Wartość', type: 'number' },
      { key: 'suffix', label: 'Sufiks', type: 'text' },
      { key: 'label', label: 'Etykieta', type: 'text' },
    ],
  },
  team: {
    name: 'people',
    label: 'Członkowie zespołu',
    itemLabel: 'Osoba',
    fields: [
      { key: 'photo', label: 'Zdjęcie', type: 'media' },
      { key: 'name', label: 'Imię i nazwisko', type: 'text' },
      { key: 'role', label: 'Stanowisko', type: 'text' },
      { key: 'bio', label: 'Bio', type: 'textarea' },
    ],
  },
  about: {
    name: 'highlights',
    label: 'Wyróżniki',
    itemLabel: 'Wyróżnik',
    maxItems: 8,
    fields: [{ key: 'text', label: 'Tekst', type: 'text' }],
  },
  mapAreaCities: {
    name: 'cities',
    label: 'Miasta',
    itemLabel: 'Miasto',
    fields: [
      { key: 'name', label: 'Nazwa', type: 'text' },
    ],
  },
  partners: {
    name: 'items',
    label: 'Partnerzy',
    itemLabel: 'Partner',
    fields: [
      { key: 'logo', label: 'Logo', type: 'media' },
      { key: 'name', label: 'Nazwa', type: 'text' },
      { key: 'url', label: 'URL', type: 'text' },
    ],
  },
  galleryFull: {
    name: 'items',
    label: 'Pozycje galerii',
    itemLabel: 'Pozycja',
    fields: [
      { key: 'image', label: 'Zdjęcie', type: 'media' },
      { key: 'alt', label: 'Opis (alt)', type: 'text' },
      { key: 'category', label: 'Kategoria (slug)', type: 'text' },
      { key: 'categoryLabel', label: 'Etykieta kategorii', type: 'text' },
    ],
  },
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
        {/* Wspólne pole blockName */}
        <FieldText
          label="Nazwa bloku (opcjonalna)"
          value={(block.blockName as string) ?? ''}
          onCommit={onCommit('blockName')}
        />

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
            <FieldMediaPicker
              label="Tło (backgroundImage)"
              value={typeof block.backgroundImage === 'number' ? block.backgroundImage : null}
              onSelect={onCommit('backgroundImage')}
            />
          </>
        )}

        {block.blockType === 'richText' && (
          <PayloadAdminLink label="Edytuj tekst w Payload Admin" pageId={pageId} />
        )}

        {block.blockType === 'stats' && (
          <FieldArrayEditor config={ARRAY_CONFIGS.stats} blockIndex={idx} />
        )}

        {block.blockType === 'services' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
            <FieldArrayEditor config={ARRAY_CONFIGS.services} blockIndex={idx} />
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
          <FieldArrayEditor config={ARRAY_CONFIGS.faq} blockIndex={idx} />
        )}

        {block.blockType === 'testimonials' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
            <FieldArrayEditor config={ARRAY_CONFIGS.testimonials} blockIndex={idx} />
          </>
        )}

        {block.blockType === 'pricing' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
            <FieldTextarea label="Podnagłówek" value={v('subheading')} onCommit={onCommit('subheading')} />
            <FieldArrayEditor config={ARRAY_CONFIGS.pricing} blockIndex={idx} />
          </>
        )}

        {block.blockType === 'steps' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
            <FieldArrayEditor config={ARRAY_CONFIGS.steps} blockIndex={idx} />
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
            <FieldArrayEditor config={ARRAY_CONFIGS.partners} blockIndex={idx} />
          </>
        )}

        {block.blockType === 'team' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
            <FieldArrayEditor config={ARRAY_CONFIGS.team} blockIndex={idx} />
          </>
        )}

        {block.blockType === 'mapArea' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
            <FieldTextarea label="Opis" value={v('description')} onCommit={onCommit('description')} />
            <FieldText label="URL mapy (embed)" value={v('embedUrl')} onCommit={onCommit('embedUrl')} />
            <FieldText label="Notatka" value={v('note')} onCommit={onCommit('note')} />
            <FieldArrayEditor config={ARRAY_CONFIGS.mapAreaCities} blockIndex={idx} />
          </>
        )}

        {block.blockType === 'offerCards' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
            <FieldArrayEditor config={ARRAY_CONFIGS.offerCards} blockIndex={idx} />
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
            <FieldMediaPicker
              label="Zdjęcie"
              value={typeof block.image === 'number' ? block.image : null}
              onSelect={onCommit('image')}
            />
            <FieldArrayEditor config={ARRAY_CONFIGS.about} blockIndex={idx} />
          </>
        )}

        {block.blockType === 'gallery' && (
          <PayloadAdminLink label="Edytuj zdjęcia w Payload Admin" pageId={pageId} />
        )}

        {block.blockType === 'galleryFull' && (
          <>
            <FieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} />
            <FieldArrayEditor config={ARRAY_CONFIGS.galleryFull} blockIndex={idx} />
          </>
        )}
      </div>
    </div>
  )
}
