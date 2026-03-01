'use client'

import { useState, useCallback, useEffect } from 'react'
import { usePageEditor } from '@/lib/page-editor-store'
import type { BlockStyleOverrides } from '@/lib/page-editor-store'
import {
  BUILT_IN_STYLE_PRESETS,
  loadSavedPresets,
  saveSavedPresets,
  type SavedStylePreset,
} from '@/lib/style-presets'
import { labelClasses, inputClasses } from './field-primitives'

interface Props {
  blockIndex: number
}

export function StylePresetsPanel({ blockIndex }: Props) {
  const sections = usePageEditor((s) => s.sections)
  const updateBlockField = usePageEditor((s) => s.updateBlockField)

  const block = sections[blockIndex] as Record<string, unknown> | undefined
  const [savedPresets, setSavedPresets] = useState<SavedStylePreset[]>([])
  const [saveName, setSaveName] = useState('')
  const [showSaveInput, setShowSaveInput] = useState(false)

  useEffect(() => {
    setSavedPresets(loadSavedPresets())
  }, [])

  const applyPreset = useCallback(
    (overrides: Partial<BlockStyleOverrides>) => {
      for (const [key, value] of Object.entries(overrides)) {
        updateBlockField(blockIndex, `styleOverrides.${key}`, value)
      }
    },
    [blockIndex, updateBlockField],
  )

  const resetAll = useCallback(() => {
    updateBlockField(blockIndex, 'styleOverrides', {})
  }, [blockIndex, updateBlockField])

  const saveCurrentStyle = useCallback(() => {
    if (!block || !saveName.trim()) return
    const overrides = (block.styleOverrides ?? {}) as Partial<BlockStyleOverrides>
    const preset: SavedStylePreset = {
      key: `custom-${Date.now()}`,
      label: saveName.trim(),
      createdAt: new Date().toISOString(),
      overrides,
    }
    const updated = [...savedPresets, preset]
    setSavedPresets(updated)
    saveSavedPresets(updated)
    setSaveName('')
    setShowSaveInput(false)
  }, [block, saveName, savedPresets])

  const deletePreset = useCallback(
    (key: string) => {
      const updated = savedPresets.filter((p) => p.key !== key)
      setSavedPresets(updated)
      saveSavedPresets(updated)
    },
    [savedPresets],
  )

  if (!block) return null

  return (
    <div className="space-y-3">
      {/* Built-in presets */}
      <div>
        <span className={labelClasses}>Wbudowane</span>
        <div className="flex flex-wrap gap-1">
          {BUILT_IN_STYLE_PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => applyPreset(p.overrides)}
              className="rounded bg-forest-800 px-2 py-1 text-[10px] font-medium text-forest-400 hover:bg-forest-700 hover:text-cream transition"
              aria-label={`Preset: ${p.label}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Saved presets */}
      {savedPresets.length > 0 && (
        <div>
          <span className={labelClasses}>Twoje presety</span>
          <div className="flex flex-wrap gap-1">
            {savedPresets.map((p) => (
              <div key={p.key} className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => applyPreset(p.overrides)}
                  className="rounded-l bg-forest-800 px-2 py-1 text-[10px] font-medium text-forest-400 hover:bg-forest-700 hover:text-cream transition"
                  aria-label={`Wczytaj preset: ${p.label}`}
                >
                  {p.label}
                </button>
                <button
                  type="button"
                  onClick={() => deletePreset(p.key)}
                  className="rounded-r bg-forest-800 px-1 py-1 text-[10px] text-red-400 hover:bg-red-900/30 transition"
                  aria-label={`Usuń preset: ${p.label}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save current style */}
      {showSaveInput ? (
        <div className="flex gap-1">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Nazwa presetu..."
            className={inputClasses + ' text-xs flex-1'}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveCurrentStyle()
              if (e.key === 'Escape') setShowSaveInput(false)
            }}
            autoFocus
            aria-label="Nazwa nowego presetu"
          />
          <button
            type="button"
            onClick={saveCurrentStyle}
            className="rounded bg-accent-warm px-2 py-1 text-xs font-medium text-forest-950 hover:bg-accent-warm-light transition"
          >
            Zapisz
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowSaveInput(true)}
          className="w-full rounded bg-forest-800 px-3 py-1.5 text-xs text-cream hover:bg-forest-700 transition"
        >
          💾 Zapisz aktualny styl
        </button>
      )}

      {/* Reset */}
      <button
        type="button"
        onClick={resetAll}
        className="w-full rounded border border-forest-700 bg-transparent px-3 py-1.5 text-xs text-forest-400 hover:text-cream hover:border-forest-600 transition"
      >
        🔄 Reset wszystkich stylów
      </button>
    </div>
  )
}
