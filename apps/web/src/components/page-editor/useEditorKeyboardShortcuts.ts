'use client'

import { useEffect } from 'react'
import { usePageEditor } from '@/lib/page-editor-store'
import type { BlockStyleOverrides } from '@/lib/page-editor-store'

export function useEditorKeyboardShortcuts() {
  const savePage = usePageEditor((s) => s.savePage)
  const isDirty = usePageEditor((s) => s.isDirty)
  const isSaving = usePageEditor((s) => s.isSaving)
  const selectedBlockIndex = usePageEditor((s) => s.selectedBlockIndex)
  const duplicateBlock = usePageEditor((s) => s.duplicateBlock)
  const removeBlock = usePageEditor((s) => s.removeBlock)
  const toggleGrid = usePageEditor((s) => s.toggleGrid)
  const undo = usePageEditor((s) => s.undo)
  const redo = usePageEditor((s) => s.redo)
  const canUndo = usePageEditor((s) => s.canUndo)
  const canRedo = usePageEditor((s) => s.canRedo)
  const shortcutsOpen = usePageEditor((s) => s.shortcutsOpen)
  const toggleShortcuts = usePageEditor((s) => s.toggleShortcuts)
  const selectBlock = usePageEditor((s) => s.selectBlock)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable

      // Ctrl+Z / Cmd+Z — undo (działa ZAWSZE, nawet w inputach)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo) undo()
        return
      }

      // Ctrl+Shift+Z / Cmd+Shift+Z — redo
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        if (canRedo) redo()
        return
      }

      // Ctrl+Y / Cmd+Y — redo (alternatywne)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        if (canRedo) redo()
        return
      }

      // Ctrl+S / Cmd+S — save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (isDirty && !isSaving) void savePage()
        return
      }

      // Shortcuts below only work when not focused in an input
      if (isInputFocused) return

      // Arrow keys — pixel-by-pixel section movement (when block selected)
      if (selectedBlockIndex !== null && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const store = usePageEditor.getState()
        const block = store.sections[selectedBlockIndex]
        if (!block) return
        const so = ((block as Record<string, unknown>).styleOverrides ?? {}) as BlockStyleOverrides

        if (e.key === 'ArrowUp') {
          store.updateBlockField(selectedBlockIndex, 'styleOverrides.offsetY', (so.offsetY ?? 0) - step)
        } else if (e.key === 'ArrowDown') {
          store.updateBlockField(selectedBlockIndex, 'styleOverrides.offsetY', (so.offsetY ?? 0) + step)
        } else if (e.key === 'ArrowLeft') {
          store.updateBlockField(selectedBlockIndex, 'styleOverrides.offsetX', (so.offsetX ?? 0) - step)
        } else if (e.key === 'ArrowRight') {
          store.updateBlockField(selectedBlockIndex, 'styleOverrides.offsetX', (so.offsetX ?? 0) + step)
        }
        return
      }

      // ? — otwórz panel skrótów
      if (e.key === '?') {
        e.preventDefault()
        toggleShortcuts()
        return
      }

      // Escape — zamknij panel skrótów lub odznacz blok
      if (e.key === 'Escape') {
        if (shortcutsOpen) {
          toggleShortcuts()
          return
        }
        if (selectedBlockIndex !== null) {
          selectBlock(null)
        }
        return
      }

      // Delete — remove selected block (with confirm)
      if (e.key === 'Delete' && selectedBlockIndex !== null) {
        e.preventDefault()
        if (window.confirm('Czy na pewno chcesz usunąć tę sekcję?')) {
          removeBlock(selectedBlockIndex)
        }
        return
      }

      // Ctrl+D / Cmd+D — duplicate selected block
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedBlockIndex !== null) {
        e.preventDefault()
        duplicateBlock(selectedBlockIndex)
        return
      }

      // Ctrl+G / Cmd+G — toggle grid
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault()
        toggleGrid()
        return
      }

      // Ctrl+0 — reset canvas zoom
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        usePageEditor.getState().resetCanvasView()
        return
      }

      // Ctrl++ / Ctrl+= — zoom in
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault()
        const store = usePageEditor.getState()
        store.setCanvasZoom(store.canvasZoom + 0.1)
        return
      }

      // Ctrl+- — zoom out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        const store = usePageEditor.getState()
        store.setCanvasZoom(store.canvasZoom - 0.1)
        return
      }

      // Ctrl+A — select all blocks (canvas mode only, not in inputs)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        const store = usePageEditor.getState()
        if (store.canvasMode === 'canvas') {
          e.preventDefault()
          store.sections.forEach((_, i) => store.toggleBlockSelection(i))
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [savePage, isDirty, isSaving, selectedBlockIndex, duplicateBlock, removeBlock, toggleGrid, undo, redo, canUndo, canRedo, shortcutsOpen, toggleShortcuts, selectBlock])
}
