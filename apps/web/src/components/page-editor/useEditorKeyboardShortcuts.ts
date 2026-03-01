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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)

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
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [savePage, isDirty, isSaving, selectedBlockIndex, duplicateBlock, removeBlock])
}
