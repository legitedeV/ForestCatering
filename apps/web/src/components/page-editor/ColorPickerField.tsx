'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { REPO_SWATCHES } from '@/lib/style-presets'
import { inputClasses, labelClasses } from './field-primitives'

interface ColorPickerFieldProps {
  label: string
  value: string | undefined
  onChange: (color: string) => void
  showOpacity?: boolean
  swatches?: string[]
}

function hexToOpacity(color: string | undefined): number {
  if (!color) return 100
  const m = color.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/)
  if (m) return Math.round(parseFloat(m[1]) * 100)
  return 100
}

function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  if (opacity >= 100) return hex
  return `rgba(${r},${g},${b},${(opacity / 100).toFixed(2)})`
}

function colorToHex(color: string | undefined): string {
  if (!color || color === 'transparent') return '#000000'
  if (color.startsWith('#')) return color.substring(0, 7)
  const m = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (m) {
    const r = parseInt(m[1]).toString(16).padStart(2, '0')
    const g = parseInt(m[2]).toString(16).padStart(2, '0')
    const b = parseInt(m[3]).toString(16).padStart(2, '0')
    return `#${r}${g}${b}`
  }
  return '#000000'
}

export function ColorPickerField({
  label,
  value,
  onChange,
  showOpacity = true,
  swatches = REPO_SWATCHES,
}: ColorPickerFieldProps) {
  const [hexInput, setHexInput] = useState(colorToHex(value))
  const [opacity, setOpacity] = useState(hexToOpacity(value))
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setHexInput(colorToHex(value))
    setOpacity(hexToOpacity(value))
  }, [value])

  const commit = useCallback(
    (hex: string, op: number) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onChange(hexToRgba(hex, op))
      }, 150)
    },
    [onChange],
  )

  const handleColorInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value
      setHexInput(hex)
      commit(hex, opacity)
    },
    [commit, opacity],
  )

  const handleHexText = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      setHexInput(v)
      if (/^#[0-9a-fA-F]{6}$/.test(v)) {
        commit(v, opacity)
      }
    },
    [commit, opacity],
  )

  const handleOpacity = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const op = parseInt(e.target.value) || 0
      setOpacity(op)
      commit(hexInput, op)
    },
    [commit, hexInput],
  )

  const handleEyeDropper = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dropper = new (window as any).EyeDropper()
      const result = await dropper.open()
      const hex = result.sRGBHex as string
      setHexInput(hex)
      commit(hex, opacity)
    } catch {
      // user cancelled or unsupported
    }
  }, [commit, opacity])

  const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window

  return (
    <div className="space-y-1.5">
      <span className={labelClasses}>{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hexInput}
          onChange={handleColorInput}
          className="h-8 w-8 shrink-0 cursor-pointer rounded border border-forest-700 bg-forest-800 p-0.5"
          aria-label={`${label} kolor`}
        />
        <input
          type="text"
          value={hexInput}
          onChange={handleHexText}
          className={inputClasses + ' font-mono text-xs'}
          maxLength={7}
          aria-label={`${label} hex`}
        />
        {hasEyeDropper && (
          <button
            type="button"
            onClick={handleEyeDropper}
            className="shrink-0 rounded border border-forest-700 bg-forest-800 px-2 py-1.5 text-xs text-cream hover:bg-forest-700"
            title="Eyedropper"
            aria-label="Eyedropper"
          >
            💧
          </button>
        )}
      </div>

      {showOpacity && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-forest-400 shrink-0 w-16">Opacity</span>
          <input
            type="range"
            min={0}
            max={100}
            value={opacity}
            onChange={handleOpacity}
            className="flex-1 accent-accent-warm"
            aria-label={`${label} opacity`}
          />
          <span className="text-[10px] text-forest-400 w-8 text-right">{opacity}%</span>
        </div>
      )}

      {swatches.length > 0 && (
        <div className="swatch-grid">
          {swatches.map((sw) => (
            <button
              key={sw}
              type="button"
              onClick={() => {
                if (sw === 'transparent') {
                  onChange('transparent')
                } else {
                  setHexInput(sw)
                  commit(sw, opacity)
                }
              }}
              className={`swatch ${value === sw ? 'active' : ''}`}
              style={{
                background: sw === 'transparent'
                  ? 'repeating-conic-gradient(#555 0% 25%, #333 0% 50%) 50%/8px 8px'
                  : sw,
              }}
              title={sw}
              aria-label={`Swatch ${sw}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
