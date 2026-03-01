'use client'

import React, { useRef, useCallback } from 'react'
import { Reorder, useDragControls, motion, AnimatePresence } from 'framer-motion'
import { usePageEditor } from '@/lib/page-editor-store'
import { getBlockMeta } from '@/lib/block-metadata'
import type { PageSection } from '@/components/cms/types'

// Pomocnik — wyciągnij subtitle z bloku (heading lub pierwszy tekst)
function getBlockSubtitle(block: PageSection): string {
  const b = block as Record<string, unknown>
  if (typeof b.heading === 'string' && b.heading) {
    return b.heading.length > 60 ? b.heading.slice(0, 60) + '...' : b.heading
  }
  if (typeof b.text === 'string' && b.text) {
    return b.text.length > 60 ? b.text.slice(0, 60) + '...' : b.text
  }
  return ''
}

// Przycisk „+ Dodaj sekcję" między blokami
function InsertButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="group flex items-center py-1">
      <div className="h-px flex-1 bg-forest-700 transition group-hover:bg-accent/50" />
      <button
        onClick={onClick}
        className="mx-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-forest-700 text-xs text-forest-500 transition hover:border-accent hover:bg-accent hover:text-forest-950"
        aria-label="Dodaj sekcję"
      >
        +
      </button>
      <div className="h-px flex-1 bg-forest-700 transition group-hover:bg-accent/50" />
    </div>
  )
}

// Pojedyncza karta bloku — Reorder.Item
function BlockCard({
  block,
  index,
  total,
}: {
  block: PageSection
  index: number
  total: number
}) {
  const controls = useDragControls()
  const selectedBlockIndex = usePageEditor((s) => s.selectedBlockIndex)
  const selectBlock = usePageEditor((s) => s.selectBlock)
  const setSidebarTab = usePageEditor((s) => s.setSidebarTab)
  const moveBlock = usePageEditor((s) => s.moveBlock)
  const duplicateBlock = usePageEditor((s) => s.duplicateBlock)
  const removeBlock = usePageEditor((s) => s.removeBlock)

  const meta = getBlockMeta(block.blockType)
  const isSelected = selectedBlockIndex === index
  const subtitle = getBlockSubtitle(block)
  const blockName = (block as Record<string, unknown>).blockName as string | undefined

  const handleSelect = useCallback(() => {
    selectBlock(index)
    setSidebarTab('settings')
  }, [index, selectBlock, setSidebarTab])

  return (
    <Reorder.Item
      value={block}
      dragControls={controls}
      dragListener={false}
      className={`group flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
        isSelected
          ? 'border-accent ring-1 ring-accent/30 bg-forest-800/60'
          : 'border-forest-700 hover:border-forest-600 bg-forest-900'
      }`}
      onClick={handleSelect}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleSelect()
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Blok ${meta?.label ?? block.blockType} #${index + 1}`}
      aria-selected={isSelected}
    >
      {/* Drag handle */}
      <button
        onPointerDown={(e) => controls.start(e)}
        className="shrink-0 cursor-grab touch-none text-forest-500 hover:text-cream active:cursor-grabbing"
        aria-label="Przeciągnij blok"
        tabIndex={-1}
      >
        ⠿
      </button>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{meta?.icon ?? '📦'}</span>
          <span className="text-sm font-medium text-cream">{meta?.label ?? block.blockType}</span>
          {blockName && (
            <span className="truncate text-xs text-forest-400">— {blockName}</span>
          )}
        </div>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-forest-500">{subtitle}</p>
        )}
      </div>

      {/* Akcje */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
        <button
          onClick={(e) => { e.stopPropagation(); if (index > 0) moveBlock(index, index - 1) }}
          disabled={index === 0}
          className="rounded p-1 text-forest-400 hover:bg-forest-700 hover:text-cream disabled:opacity-30"
          aria-label="Przesuń w górę"
          title="Przesuń w górę"
        >
          ▲
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); if (index < total - 1) moveBlock(index, index + 1) }}
          disabled={index === total - 1}
          className="rounded p-1 text-forest-400 hover:bg-forest-700 hover:text-cream disabled:opacity-30"
          aria-label="Przesuń w dół"
          title="Przesuń w dół"
        >
          ▼
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); duplicateBlock(index) }}
          className="rounded p-1 text-forest-400 hover:bg-forest-700 hover:text-cream"
          aria-label="Duplikuj blok"
          title="Duplikuj"
        >
          📋
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (window.confirm('Czy na pewno chcesz usunąć tę sekcję?')) removeBlock(index)
          }}
          className="rounded p-1 text-forest-400 hover:bg-red-900/50 hover:text-red-400"
          aria-label="Usuń blok"
          title="Usuń"
        >
          🗑️
        </button>
      </div>
    </Reorder.Item>
  )
}

export function EditorCanvas() {
  const sections = usePageEditor((s) => s.sections)
  const isLoading = usePageEditor((s) => s.isLoading)
  const error = usePageEditor((s) => s.error)
  const previewBreakpoint = usePageEditor((s) => s.previewBreakpoint)
  const setSidebarTab = usePageEditor((s) => s.setSidebarTab)
  const loadPage = usePageEditor((s) => s.loadPage)
  const pageId = usePageEditor((s) => s.pageId)
  const selectBlock = usePageEditor((s) => s.selectBlock)
  const addBlock = usePageEditor((s) => s.addBlock)

  // Ref przechowujący indeks do wstawienia nowego bloku
  const insertAtIndexRef = useRef<number>(sections.length)

  // Szerokość wg breakpointa
  const widthClass =
    previewBreakpoint === 'tablet'
      ? 'max-w-[768px]'
      : previewBreakpoint === 'mobile'
        ? 'max-w-[375px]'
        : 'max-w-5xl'

  // Obsługa reorder — aktualizacja store
  const handleReorder = useCallback((newOrder: PageSection[]) => {
    // Znajdujemy nowe pozycje i aktualizujemy sekcje w store
    const store = usePageEditor.getState()
    // Zamiast moveBlock (jeden element), ustawiamy cały nowy układ
    // Symulujemy przez znalezienie co się przesunęło
    const oldSections = store.sections
    if (oldSections.length !== newOrder.length) return

    // Znajdź element który zmienił pozycję
    for (let i = 0; i < oldSections.length; i++) {
      if (oldSections[i] !== newOrder[i]) {
        const movedItem = newOrder[i]
        const oldIndex = oldSections.indexOf(movedItem)
        if (oldIndex !== -1 && oldIndex !== i) {
          store.moveBlock(oldIndex, i)
          return
        }
      }
    }
  }, [])

  // Stan ładowania
  if (isLoading) {
    return (
      <div className={`mx-auto ${widthClass} space-y-3 p-6 transition-all duration-300`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-forest-800" />
        ))}
      </div>
    )
  }

  // Stan błędu
  if (error) {
    return (
      <div className={`mx-auto ${widthClass} p-6 transition-all duration-300`}>
        <div className="rounded-lg border border-red-800/50 bg-red-900/20 p-6 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => { if (pageId) void loadPage(pageId) }}
            className="mt-3 rounded-lg bg-forest-800 px-4 py-2 text-sm text-cream transition hover:bg-forest-700"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    )
  }

  // Stan pusty
  if (sections.length === 0) {
    return (
      <div className={`mx-auto ${widthClass} p-6 transition-all duration-300`}>
        <div className="rounded-lg border border-dashed border-forest-700 p-12 text-center">
          <p className="text-forest-400">Strona nie ma sekcji — dodaj pierwszą!</p>
          <button
            onClick={() => {
              insertAtIndexRef.current = 0
              setSidebarTab('add')
            }}
            className="mt-4 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-forest-950 transition hover:bg-accent-light"
            aria-label="Dodaj pierwszą sekcję"
          >
            + Dodaj sekcję
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`mx-auto ${widthClass} space-y-0 p-6 transition-all duration-300`}>
      {/* Przycisk dodawania na początku */}
      <InsertButton
        onClick={() => {
          insertAtIndexRef.current = 0
          setSidebarTab('add')
        }}
      />

      <Reorder.Group
        axis="y"
        values={sections}
        onReorder={handleReorder}
        className="space-y-1"
      >
        <AnimatePresence initial={false}>
          {sections.map((block, index) => (
            <motion.div key={block.id ?? `block-${index}`} layout>
              <BlockCard
                block={block}
                index={index}
                total={sections.length}
              />
              {/* Przycisk dodawania po każdym bloku */}
              <InsertButton
                onClick={() => {
                  insertAtIndexRef.current = index + 1
                  setSidebarTab('add')
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  )
}
