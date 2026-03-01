'use client'

import { useState } from 'react'
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
import { AnimationPicker } from './AnimationPicker'
import { AiSuggestPopover } from './AiSuggestPopover'
import { CollapsibleSection } from './CollapsibleSection'
import { TypographyPanel } from './TypographyPanel'
import { ColorsPanel } from './ColorsPanel'
import { BackgroundPanel } from './BackgroundPanel'
import { BorderShadowPanel } from './BorderShadowPanel'
import { VisibilityPanel } from './VisibilityPanel'
import { StylePresetsPanel } from './StylePresetsPanel'
import { CustomCssEditor } from './CustomCssEditor'

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
// AI Suggest wrapper for text fields
// ────────────────────────────────────────────────────────

// Field paths that should NOT show AI suggest (links, urls, emails, phones)
const AI_EXCLUDED_PATTERNS = ['link', 'url', 'email', 'phone', 'Link', 'Url', 'embedUrl']

function AiFieldText({
  label,
  value,
  onCommit,
  blockType,
  fieldPath,
  type,
}: {
  label: string
  value: string
  onCommit: (v: string) => void
  blockType: string
  fieldPath: string
  type?: string
}) {
  const [showAi, setShowAi] = useState(false)
  const isExcluded = AI_EXCLUDED_PATTERNS.some((p) => fieldPath.toLowerCase().includes(p.toLowerCase()))

  return (
    <div className="relative">
      {!isExcluded && (
        <button
          onClick={() => setShowAi(!showAi)}
          className="absolute -top-0.5 right-0 z-10 rounded px-1 py-0.5 text-[10px] text-forest-500 transition hover:bg-forest-800 hover:text-accent"
          title="Sugestie AI"
          aria-label="Sugestie AI"
          type="button"
        >
          ✨
        </button>
      )}
      <FieldText label={label} value={value} onCommit={onCommit} type={type} />
      {showAi && !isExcluded && (
        <AiSuggestPopover
          blockType={blockType}
          fieldPath={fieldPath}
          onApply={(v) => onCommit(v)}
          onClose={() => setShowAi(false)}
        />
      )}
    </div>
  )
}

function AiFieldTextarea({
  label,
  value,
  onCommit,
  blockType,
  fieldPath,
}: {
  label: string
  value: string
  onCommit: (v: string) => void
  blockType: string
  fieldPath: string
}) {
  const [showAi, setShowAi] = useState(false)
  const isExcluded = AI_EXCLUDED_PATTERNS.some((p) => fieldPath.toLowerCase().includes(p.toLowerCase()))

  return (
    <div className="relative">
      {!isExcluded && (
        <button
          onClick={() => setShowAi(!showAi)}
          className="absolute -top-0.5 right-0 z-10 rounded px-1 py-0.5 text-[10px] text-forest-500 transition hover:bg-forest-800 hover:text-accent"
          title="Sugestie AI"
          aria-label="Sugestie AI"
          type="button"
        >
          ✨
        </button>
      )}
      <FieldTextarea label={label} value={value} onCommit={onCommit} />
      {showAi && !isExcluded && (
        <AiSuggestPopover
          blockType={blockType}
          fieldPath={fieldPath}
          onApply={(v) => onCommit(v)}
          onClose={() => setShowAi(false)}
        />
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

      {/* Animacja bloku */}
      <div className="border-b border-forest-800 pb-3 mb-3">
        <AnimationPicker blockIndex={idx} />
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
            <AiFieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} blockType="hero" fieldPath="heading" />
            <AiFieldTextarea label="Podnagłówek" value={v('subheading')} onCommit={onCommit('subheading')} blockType="hero" fieldPath="subheading" />
            <AiFieldText label="Tekst CTA" value={v('ctaText')} onCommit={onCommit('ctaText')} blockType="hero" fieldPath="ctaText" />
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
            <AiFieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} blockType="services" fieldPath="heading" />
            <FieldArrayEditor config={ARRAY_CONFIGS.services} blockIndex={idx} />
          </>
        )}

        {block.blockType === 'cta' && (
          <>
            <AiFieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} blockType="cta" fieldPath="heading" />
            <AiFieldTextarea label="Tekst" value={v('text')} onCommit={onCommit('text')} blockType="cta" fieldPath="text" />
            <AiFieldText label="Tekst przycisku" value={v('buttonText')} onCommit={onCommit('buttonText')} blockType="cta" fieldPath="buttonText" />
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
            <AiFieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} blockType="pricing" fieldPath="heading" />
            <AiFieldTextarea label="Podnagłówek" value={v('subheading')} onCommit={onCommit('subheading')} blockType="pricing" fieldPath="subheading" />
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
            <AiFieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} blockType="contactForm" fieldPath="heading" />
            <AiFieldTextarea label="Podnagłówek" value={v('subheading')} onCommit={onCommit('subheading')} blockType="contactForm" fieldPath="subheading" />
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
            <AiFieldText label="Nagłówek" value={v('heading')} onCommit={onCommit('heading')} blockType="about" fieldPath="heading" />
            <AiFieldText label="Badge" value={v('badge')} onCommit={onCommit('badge')} blockType="about" fieldPath="badge" />
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

      {/* === Deep Styling Panels (collapsible) === */}
      <CollapsibleSection title="🔤 Typografia" defaultOpen={false}>
        <TypographyPanel blockIndex={idx} />
      </CollapsibleSection>

      <CollapsibleSection title="🎨 Kolory" defaultOpen={false}>
        <ColorsPanel blockIndex={idx} />
      </CollapsibleSection>

      <CollapsibleSection title="🖼️ Tło" defaultOpen={false}>
        <BackgroundPanel blockIndex={idx} />
      </CollapsibleSection>

      <CollapsibleSection title="◻️ Obramowanie i cień" defaultOpen={false}>
        <BorderShadowPanel blockIndex={idx} />
      </CollapsibleSection>

      <CollapsibleSection title="👁️ Widoczność" defaultOpen={false}>
        <VisibilityPanel blockIndex={idx} />
      </CollapsibleSection>

      <CollapsibleSection title="💾 Style Presets" defaultOpen={false}>
        <StylePresetsPanel blockIndex={idx} />
      </CollapsibleSection>

      <CollapsibleSection title="🖥️ Custom CSS" defaultOpen={false}>
        <CustomCssEditor blockIndex={idx} />
      </CollapsibleSection>
    </div>
  )
}
