'use client'

import { use, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePageEditor } from '@/lib/page-editor-store'
import { EditorToolbar, EditorCanvas, EditorSidebar } from '@/components/page-editor'
import { LivePreviewFrame } from '@/components/page-editor/LivePreviewFrame'
import { useEditorKeyboardShortcuts } from '@/components/page-editor/useEditorKeyboardShortcuts'

type ViewMode = 'structure' | 'preview'

export default function PageEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const pageId = Number(id)

  const loadPage = usePageEditor((s) => s.loadPage)
  const resetEditor = usePageEditor((s) => s.resetEditor)
  const isLoading = usePageEditor((s) => s.isLoading)
  const isDirty = usePageEditor((s) => s.isDirty)
  const error = usePageEditor((s) => s.error)

  const [viewMode, setViewMode] = useState<ViewMode>('structure')

  useEditorKeyboardShortcuts()

  // Załaduj stronę na mount, resetuj na unmount
  useEffect(() => {
    loadPage(pageId)
    return () => resetEditor()
  }, [pageId, loadPage, resetEditor])

  // Ostrzeżenie przed opuszczeniem strony z niezapisanymi zmianami
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // Stan ładowania — pulsujący skeleton
  if (isLoading) {
    return (
      <div className="flex h-screen flex-col">
        <div className="h-14 animate-pulse bg-forest-900" />
        <div className="flex flex-1">
          <div className="flex flex-1 flex-col gap-4 p-6">
            <div className="h-8 w-48 animate-pulse rounded bg-forest-800" />
            <div className="h-64 animate-pulse rounded bg-forest-800" />
            <div className="h-32 animate-pulse rounded bg-forest-800" />
            <div className="h-48 animate-pulse rounded bg-forest-800" />
          </div>
          <div className="w-80 animate-pulse bg-forest-900" />
        </div>
      </div>
    )
  }

  // Stan błędu
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-lg text-red-400">{error}</p>
          <button
            onClick={() => loadPage(pageId)}
            className="rounded-lg bg-accent px-6 py-2 font-medium text-forest-950 transition-colors hover:bg-accent/90"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Górny pasek narzędzi */}
      <EditorToolbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Główny obszar */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Toggle widoku: Struktura / Podgląd na żywo */}
          <div className="flex gap-1 border-b border-forest-700 bg-forest-900 px-4 py-2">
            <button
              onClick={() => setViewMode('structure')}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'structure'
                  ? 'bg-accent text-forest-950'
                  : 'text-cream/70 hover:text-cream'
              }`}
            >
              Widok struktury
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'preview'
                  ? 'bg-accent text-forest-950'
                  : 'text-cream/70 hover:text-cream'
              }`}
            >
              Podgląd na żywo
            </button>
          </div>

          {/* Zawartość — animowany przełącznik */}
          <div className="relative flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              {viewMode === 'structure' ? (
                <motion.div
                  key="structure"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <EditorCanvas />
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <LivePreviewFrame />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar po prawej */}
        <EditorSidebar />
      </div>
    </div>
  )
}
