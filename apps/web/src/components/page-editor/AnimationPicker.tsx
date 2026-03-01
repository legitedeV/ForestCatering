'use client'

import { useState, useCallback } from 'react'
import { usePageEditor } from '@/lib/page-editor-store'
import {
  ANIMATION_CATALOG,
  ANIMATION_CATEGORIES,
  type AnimationDefinition,
} from '@/lib/animation-catalog'

interface AnimationPickerProps {
  blockIndex: number
}

function MiniPreview({ anim }: { anim: AnimationDefinition }) {
  const [replay, setReplay] = useState(0)
  const isContinuous = anim.category === 'continuous' || anim.category === 'decorative'
  const cls = anim.className ?? ''

  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-forest-700 bg-forest-900 text-xs"
      onMouseEnter={() => setReplay((r) => r + 1)}
      title={anim.preview}
    >
      <div
        key={replay}
        className={`h-5 w-5 rounded-sm bg-accent-warm/60 ${isContinuous ? cls : `${cls} visible`}`}
      />
    </div>
  )
}

export function AnimationPicker({ blockIndex }: AnimationPickerProps) {
  const sections = usePageEditor((s) => s.sections)
  const updateBlockField = usePageEditor((s) => s.updateBlockField)

  const block = sections[blockIndex] as Record<string, unknown> | undefined
  if (!block) return null

  const currentAnimation = (block.animation as string) ?? ''
  const currentDelay = (block.animationDelay as number) ?? 0
  const currentDuration = (block.animationDuration as number) ?? 0

  const [filterCategory, setFilterCategory] = useState<string>('all')

  const handleSelect = useCallback(
    (key: string) => {
      updateBlockField(blockIndex, 'animation', key === currentAnimation ? '' : key)
    },
    [blockIndex, currentAnimation, updateBlockField],
  )

  const handleDelay = useCallback(
    (val: number) => {
      updateBlockField(blockIndex, 'animationDelay', val)
    },
    [blockIndex, updateBlockField],
  )

  const handleDuration = useCallback(
    (val: number) => {
      updateBlockField(blockIndex, 'animationDuration', val)
    },
    [blockIndex, updateBlockField],
  )

  const filtered =
    filterCategory === 'all'
      ? ANIMATION_CATALOG
      : ANIMATION_CATALOG.filter((a) => a.category === filterCategory)

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-cream">🎬 Animacja bloku</p>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => setFilterCategory('all')}
          className={`rounded px-2 py-0.5 text-[10px] font-medium transition ${
            filterCategory === 'all'
              ? 'bg-accent-warm text-forest-950'
              : 'bg-forest-800 text-forest-400 hover:text-cream'
          }`}
          aria-pressed={filterCategory === 'all'}
        >
          Wszystkie
        </button>
        {ANIMATION_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setFilterCategory(cat.key)}
            className={`rounded px-2 py-0.5 text-[10px] font-medium transition ${
              filterCategory === cat.key
                ? 'bg-accent-warm text-forest-950'
                : 'bg-forest-800 text-forest-400 hover:text-cream'
            }`}
            aria-pressed={filterCategory === cat.key}
            title={cat.description}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Animation list */}
      <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-forest-800 bg-forest-900/50 p-1">
        {/* None option */}
        <button
          onClick={() => updateBlockField(blockIndex, 'animation', '')}
          className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition ${
            !currentAnimation
              ? 'bg-accent-warm/20 text-accent-warm'
              : 'text-forest-400 hover:bg-forest-800 hover:text-cream'
          }`}
          aria-label="Brak animacji"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-forest-700 bg-forest-900 text-sm">
            ✕
          </span>
          <span>Brak animacji</span>
        </button>

        {filtered.map((anim) => (
          <button
            key={anim.key}
            onClick={() => handleSelect(anim.key)}
            className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition ${
              currentAnimation === anim.key
                ? 'bg-accent-warm/20 text-accent-warm'
                : 'text-forest-400 hover:bg-forest-800 hover:text-cream'
            }`}
            title={anim.description}
            aria-label={`Animacja: ${anim.label}`}
            aria-pressed={currentAnimation === anim.key}
          >
            <MiniPreview anim={anim} />
            <div className="min-w-0 flex-1">
              <span className="block truncate font-medium">{anim.label}</span>
              <span className="block truncate text-[10px] text-forest-500">{anim.description}</span>
            </div>
            <span className="shrink-0 text-[10px] text-forest-600">{anim.preview}</span>
          </button>
        ))}
      </div>

      {/* Delay & Duration */}
      {currentAnimation && (
        <div className="flex gap-3">
          <label className="flex-1">
            <span className="mb-0.5 block text-[10px] text-forest-400">Opóźnienie (ms)</span>
            <input
              type="number"
              min={0}
              max={1000}
              step={50}
              value={currentDelay}
              onChange={(e) => handleDelay(Number(e.target.value))}
              className="w-full rounded-md border border-forest-700 bg-forest-900 px-2 py-1 text-xs text-cream focus:border-accent-warm focus:outline-none"
              aria-label="Opóźnienie animacji w milisekundach"
            />
          </label>
          <label className="flex-1">
            <span className="mb-0.5 block text-[10px] text-forest-400">Czas trwania (ms)</span>
            <input
              type="number"
              min={300}
              max={2000}
              step={100}
              value={currentDuration}
              onChange={(e) => handleDuration(Number(e.target.value))}
              className="w-full rounded-md border border-forest-700 bg-forest-900 px-2 py-1 text-xs text-cream focus:border-accent-warm focus:outline-none"
              aria-label="Czas trwania animacji w milisekundach"
            />
          </label>
        </div>
      )}
    </div>
  )
}
