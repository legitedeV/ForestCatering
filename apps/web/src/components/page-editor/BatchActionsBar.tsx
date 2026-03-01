'use client'

import { usePageEditor } from '@/lib/page-editor-store'

export function BatchActionsBar() {
  const selectedBlockIndices = usePageEditor((s) => s.selectedBlockIndices)
  const clearBlockSelection = usePageEditor((s) => s.clearBlockSelection)
  const batchDeleteBlocks = usePageEditor((s) => s.batchDeleteBlocks)
  const batchDuplicateBlocks = usePageEditor((s) => s.batchDuplicateBlocks)

  if (selectedBlockIndices.length === 0) return null

  return (
    <div
      className="sticky bottom-4 z-30 mx-auto flex w-fit items-center gap-3 rounded-xl border border-accent-warm/40 bg-forest-950/95 px-4 py-2.5 shadow-lg backdrop-blur-sm"
      role="toolbar"
      aria-label="Akcje wsadowe"
    >
      <span className="text-xs font-semibold text-accent-warm">
        {selectedBlockIndices.length} {selectedBlockIndices.length === 1 ? 'blok' : 'bloków'} zaznaczonych
      </span>

      <div className="h-4 w-px bg-forest-700" />

      <button
        onClick={batchDuplicateBlocks}
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-cream transition hover:bg-forest-800"
        aria-label="Zduplikuj zaznaczone bloki"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        Duplikuj
      </button>

      <button
        onClick={() => {
          if (window.confirm(`Czy na pewno usunąć ${selectedBlockIndices.length} zaznaczonych bloków?`)) {
            batchDeleteBlocks()
          }
        }}
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-red-400 transition hover:bg-red-900/30"
        aria-label="Usuń zaznaczone bloki"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
        </svg>
        Usuń
      </button>

      <div className="h-4 w-px bg-forest-700" />

      <button
        onClick={clearBlockSelection}
        className="rounded-md p-1 text-forest-400 transition hover:bg-forest-800 hover:text-cream"
        aria-label="Odznacz wszystkie"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
