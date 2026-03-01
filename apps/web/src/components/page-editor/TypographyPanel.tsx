'use client'

import { useCallback } from 'react'
import { usePageEditor } from '@/lib/page-editor-store'
import { TYPO_PRESETS } from '@/lib/style-presets'
import { FieldNumber, FieldSelect, labelClasses } from './field-primitives'

interface Props {
  blockIndex: number
}

const WEIGHT_OPTIONS = [
  { value: '300', label: 'Light (300)' },
  { value: '400', label: 'Regular (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'Semi Bold (600)' },
  { value: '700', label: 'Bold (700)' },
  { value: '800', label: 'Extra Bold (800)' },
  { value: '900', label: 'Black (900)' },
]

const ALIGN_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'left', label: '≡ L' },
  { value: 'center', label: '≡ C' },
  { value: 'right', label: '≡ R' },
  { value: 'justify', label: '≡ J' },
]

const TRANSFORM_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'none', label: 'Aa' },
  { value: 'uppercase', label: 'AA' },
  { value: 'lowercase', label: 'aa' },
  { value: 'capitalize', label: 'Ab' },
]

export function TypographyPanel({ blockIndex }: Props) {
  const sections = usePageEditor((s) => s.sections)
  const updateBlockField = usePageEditor((s) => s.updateBlockField)

  const set = useCallback(
    (key: string, value: unknown) => {
      updateBlockField(blockIndex, `styleOverrides.${key}`, value)
    },
    [blockIndex, updateBlockField],
  )

  const applyPreset = useCallback(
    (preset: (typeof TYPO_PRESETS)[number]) => {
      set('fontSize', preset.fontSize)
      set('fontWeight', preset.fontWeight)
      set('lineHeight', preset.lineHeight)
      set('letterSpacing', preset.letterSpacing)
      if ('textTransform' in preset) {
        set('textTransform', preset.textTransform)
      }
    },
    [set],
  )

  const block = sections[blockIndex] as Record<string, unknown> | undefined
  if (!block) return null

  const styleOverrides = (block.styleOverrides ?? {}) as Record<string, unknown>

  const fontSize = (styleOverrides.fontSize as number) ?? 16
  const fontWeight = String((styleOverrides.fontWeight as number) ?? 400)
  const lineHeight = (styleOverrides.lineHeight as number) ?? 1.5
  const letterSpacing = (styleOverrides.letterSpacing as number) ?? 0
  const textAlign = (styleOverrides.textAlign as string) ?? 'left'
  const textTransform = (styleOverrides.textTransform as string) ?? 'none'

  return (
    <div className="space-y-3">
      <FieldNumber label="Rozmiar (px)" value={fontSize} onCommit={(v) => set('fontSize', v)} />

      <FieldSelect
        label="Grubość"
        value={fontWeight}
        options={WEIGHT_OPTIONS}
        onChange={(v) => set('fontWeight', Number(v))}
      />

      <div>
        <span className={labelClasses}>Wysokość linii</span>
        <input
          type="number"
          min={1}
          max={2.5}
          step={0.05}
          value={lineHeight}
          onChange={(e) => set('lineHeight', parseFloat(e.target.value) || 1.5)}
          className="w-full rounded-lg bg-forest-800 border border-forest-700 px-3 py-2 text-sm text-cream focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          aria-label="Wysokość linii"
        />
      </div>

      <div>
        <span className={labelClasses}>Odstęp liter (em)</span>
        <input
          type="number"
          min={-0.05}
          max={0.3}
          step={0.01}
          value={letterSpacing}
          onChange={(e) => set('letterSpacing', parseFloat(e.target.value) || 0)}
          className="w-full rounded-lg bg-forest-800 border border-forest-700 px-3 py-2 text-sm text-cream focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          aria-label="Odstęp liter"
        />
      </div>

      {/* Align buttons */}
      <div>
        <span className={labelClasses}>Wyrównanie</span>
        <div className="flex gap-1">
          {ALIGN_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('textAlign', opt.value)}
              className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition ${
                textAlign === opt.value
                  ? 'bg-accent-warm text-forest-950'
                  : 'bg-forest-800 text-forest-400 hover:text-cream'
              }`}
              aria-pressed={textAlign === opt.value}
              aria-label={`Wyrównanie: ${opt.value}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transform buttons */}
      <div>
        <span className={labelClasses}>Transformacja</span>
        <div className="flex gap-1">
          {TRANSFORM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('textTransform', opt.value)}
              className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition ${
                textTransform === opt.value
                  ? 'bg-accent-warm text-forest-950'
                  : 'bg-forest-800 text-forest-400 hover:text-cream'
              }`}
              aria-pressed={textTransform === opt.value}
              aria-label={`Transformacja: ${opt.value}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Presets */}
      <div>
        <span className={labelClasses}>Presety</span>
        <div className="flex flex-wrap gap-1">
          {TYPO_PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => applyPreset(p)}
              className="rounded bg-forest-800 px-2 py-1 text-[10px] font-medium text-forest-400 hover:bg-forest-700 hover:text-cream transition"
              aria-label={`Preset: ${p.label}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
