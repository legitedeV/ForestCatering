'use client'

import { useCallback } from 'react'
import { usePageEditor } from '@/lib/page-editor-store'
import { GRADIENT_PRESETS } from '@/lib/style-presets'
import { ColorPickerField } from './ColorPickerField'
import { labelClasses, inputClasses } from './field-primitives'

interface Props {
  blockIndex: number
}

const BG_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'solid', label: 'Kolor' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'image', label: 'Obraz' },
  { value: 'none', label: 'Brak' },
]

export function BackgroundPanel({ blockIndex }: Props) {
  const sections = usePageEditor((s) => s.sections)
  const updateBlockField = usePageEditor((s) => s.updateBlockField)

  const block = sections[blockIndex] as Record<string, unknown> | undefined
  if (!block) return null

  const styleOverrides = (block.styleOverrides ?? {}) as Record<string, unknown>
  const bgType = (styleOverrides.backgroundType as string) ?? 'solid'
  const bgGradient = (styleOverrides.backgroundGradient as string) ?? ''
  const bgImage = (styleOverrides.backgroundImage as string) ?? ''
  const overlayOpacity = (styleOverrides.backgroundOverlayOpacity as number) ?? 0
  const bgBlur = (styleOverrides.backgroundBlur as number) ?? 0

  const set = useCallback(
    (key: string, value: unknown) => {
      updateBlockField(blockIndex, `styleOverrides.${key}`, value)
    },
    [blockIndex, updateBlockField],
  )

  return (
    <div className="space-y-3">
      {/* Type selector */}
      <div>
        <span className={labelClasses}>Typ tła</span>
        <div className="flex gap-1">
          {BG_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('backgroundType', opt.value)}
              className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition ${
                bgType === opt.value
                  ? 'bg-accent-warm text-forest-950'
                  : 'bg-forest-800 text-forest-400 hover:text-cream'
              }`}
              aria-pressed={bgType === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Solid color */}
      {bgType === 'solid' && (
        <ColorPickerField
          label="Kolor tła"
          value={styleOverrides.backgroundColor as string | undefined}
          onChange={(c) => set('backgroundColor', c)}
        />
      )}

      {/* Gradient */}
      {bgType === 'gradient' && (
        <div className="space-y-2">
          <label className="block">
            <span className={labelClasses}>Wartość gradientu (CSS)</span>
            <input
              type="text"
              value={bgGradient}
              onChange={(e) => set('backgroundGradient', e.target.value)}
              placeholder="linear-gradient(135deg, #12161B, #333A43)"
              className={inputClasses + ' font-mono text-xs'}
              aria-label="Gradient CSS"
            />
          </label>

          {bgGradient && (
            <div
              className="gradient-preview"
              style={{ background: bgGradient }}
              aria-label="Podgląd gradientu"
            />
          )}

          <div>
            <span className={labelClasses}>Presety gradientów</span>
            <div className="flex flex-wrap gap-1">
              {GRADIENT_PRESETS.map((gp) => (
                <button
                  key={gp.key}
                  type="button"
                  onClick={() => set('backgroundGradient', gp.value)}
                  className="rounded bg-forest-800 px-2 py-1 text-[10px] font-medium text-forest-400 hover:bg-forest-700 hover:text-cream transition"
                  title={gp.value}
                  aria-label={`Gradient: ${gp.label}`}
                >
                  {gp.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image */}
      {bgType === 'image' && (
        <div className="space-y-2">
          <label className="block">
            <span className={labelClasses}>URL obrazu</span>
            <input
              type="text"
              value={bgImage}
              onChange={(e) => set('backgroundImage', e.target.value)}
              placeholder="https://..."
              className={inputClasses + ' text-xs'}
              aria-label="URL obrazu tła"
            />
          </label>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-forest-400 shrink-0 w-20">Overlay opacity</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(overlayOpacity * 100)}
              onChange={(e) => set('backgroundOverlayOpacity', parseInt(e.target.value) / 100)}
              className="flex-1 accent-accent-warm"
              aria-label="Overlay opacity"
            />
            <span className="text-[10px] text-forest-400 w-8 text-right">{Math.round(overlayOpacity * 100)}%</span>
          </div>
        </div>
      )}

      {/* Backdrop blur */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-forest-400 shrink-0 w-20">Backdrop blur</span>
        <input
          type="range"
          min={0}
          max={40}
          value={bgBlur}
          onChange={(e) => set('backgroundBlur', parseInt(e.target.value))}
          className="flex-1 accent-accent-warm"
          aria-label="Backdrop blur"
        />
        <span className="text-[10px] text-forest-400 w-8 text-right">{bgBlur}px</span>
      </div>
    </div>
  )
}
