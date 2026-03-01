'use client'

import { useCallback } from 'react'
import { usePageEditor } from '@/lib/page-editor-store'
import { SHADOW_PRESETS } from '@/lib/style-presets'
import { ColorPickerField } from './ColorPickerField'
import { labelClasses, inputClasses } from './field-primitives'
import { FieldSelect } from './field-primitives'

interface Props {
  blockIndex: number
}

const BORDER_STYLE_OPTIONS = [
  { value: 'none', label: 'Brak' },
  { value: 'solid', label: 'Ciągły' },
  { value: 'dashed', label: 'Kreskowany' },
  { value: 'dotted', label: 'Kropkowany' },
]

const OVERFLOW_OPTIONS = [
  { value: 'visible', label: 'Widoczny' },
  { value: 'hidden', label: 'Ukryty' },
  { value: 'auto', label: 'Auto' },
]

export function BorderShadowPanel({ blockIndex }: Props) {
  const sections = usePageEditor((s) => s.sections)
  const updateBlockField = usePageEditor((s) => s.updateBlockField)

  const set = useCallback(
    (key: string, value: unknown) => {
      updateBlockField(blockIndex, `styleOverrides.${key}`, value)
    },
    [blockIndex, updateBlockField],
  )

  const block = sections[blockIndex] as Record<string, unknown> | undefined
  if (!block) return null

  const so = (block.styleOverrides ?? {}) as Record<string, unknown>

  const borderRadius = (so.borderRadius as number) ?? 0
  const borderWidth = (so.borderWidth as number) ?? 0
  const borderStyle = (so.borderStyle as string) ?? 'none'
  const boxShadowPreset = (so.boxShadowPreset as string) ?? 'none'
  const boxShadowCustom = (so.boxShadow as string) ?? ''
  const opacity = (so.opacity as number) ?? 1
  const overflow = (so.overflow as string) ?? 'visible'

  return (
    <div className="space-y-3">
      {/* Border radius */}
      <div>
        <span className={labelClasses}>Border radius (px)</span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={50}
            value={borderRadius}
            onChange={(e) => set('borderRadius', parseInt(e.target.value))}
            className="flex-1 accent-accent-warm"
            aria-label="Border radius"
          />
          <span className="text-xs text-forest-400 w-8 text-right">{borderRadius}</span>
        </div>
      </div>

      {/* Border width */}
      <div>
        <span className={labelClasses}>Grubość obramowania (px)</span>
        <input
          type="number"
          min={0}
          max={8}
          value={borderWidth}
          onChange={(e) => set('borderWidth', parseInt(e.target.value) || 0)}
          className={inputClasses}
          aria-label="Grubość obramowania"
        />
      </div>

      {/* Border style */}
      <FieldSelect
        label="Styl obramowania"
        value={borderStyle}
        options={BORDER_STYLE_OPTIONS}
        onChange={(v) => set('borderStyle', v)}
      />

      {/* Border color */}
      <ColorPickerField
        label="Kolor obramowania"
        value={so.borderColor as string | undefined}
        onChange={(c) => set('borderColor', c)}
      />

      {/* Box shadow presets */}
      <div>
        <span className={labelClasses}>Cień</span>
        <div className="flex flex-wrap gap-1">
          {SHADOW_PRESETS.map((sp) => (
            <button
              key={sp.key}
              type="button"
              onClick={() => {
                set('boxShadowPreset', sp.key)
                set('boxShadow', '')
              }}
              className={`rounded px-2 py-1 text-[10px] font-medium transition ${
                boxShadowPreset === sp.key && !boxShadowCustom
                  ? 'bg-accent-warm text-forest-950'
                  : 'bg-forest-800 text-forest-400 hover:text-cream'
              }`}
              aria-pressed={boxShadowPreset === sp.key}
              aria-label={`Cień: ${sp.label}`}
            >
              {sp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom shadow */}
      <label className="block">
        <span className={labelClasses}>Custom shadow (CSS)</span>
        <input
          type="text"
          value={boxShadowCustom}
          onChange={(e) => set('boxShadow', e.target.value)}
          placeholder="0 10px 30px rgba(0,0,0,0.3)"
          className={inputClasses + ' font-mono text-xs'}
          aria-label="Custom box shadow"
        />
      </label>

      {/* Shadow preview */}
      <div className="flex justify-center py-2">
        <div
          className="shadow-preview-box"
          style={{
            boxShadow: boxShadowCustom || SHADOW_PRESETS.find((p) => p.key === boxShadowPreset)?.value || 'none',
          }}
          aria-label="Podgląd cienia"
        />
      </div>

      {/* Opacity */}
      <div>
        <span className={labelClasses}>Opacity</span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(opacity * 100)}
            onChange={(e) => set('opacity', parseInt(e.target.value) / 100)}
            className="flex-1 accent-accent-warm"
            aria-label="Opacity"
          />
          <span className="text-xs text-forest-400 w-8 text-right">{Math.round(opacity * 100)}%</span>
        </div>
      </div>

      {/* Overflow */}
      <FieldSelect
        label="Overflow"
        value={overflow}
        options={OVERFLOW_OPTIONS}
        onChange={(v) => set('overflow', v)}
      />
    </div>
  )
}
