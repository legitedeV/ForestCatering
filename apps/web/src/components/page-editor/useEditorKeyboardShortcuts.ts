'use client'

import { useEffect } from 'react'
import { usePageEditor } from '@/lib/page-editor-store'

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
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [savePage, isDirty, isSaving, selectedBlockIndex, duplicateBlock, removeBlock, toggleGrid, undo, redo, canUndo, canRedo])
}
