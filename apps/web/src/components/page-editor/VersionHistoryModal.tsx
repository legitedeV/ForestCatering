'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePageEditor } from '@/lib/page-editor-store'
import { diffSections, type SectionDiff } from '@/lib/section-diff'
import { VersionDiffView } from './VersionDiffView'
import type { PageSection } from '@/components/cms/types'

interface VersionListItem {
  id: string
  createdAt: string
  updatedAt?: string
  status: string
  title: string
  sectionsCount: number
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

export function VersionHistoryModal() {
  const pageId = usePageEditor((s) => s.pageId)
  const pageTitle = usePageEditor((s) => s.pageTitle)
  const sections = usePageEditor((s) => s.sections)
  const toggleVersionHistory = usePageEditor((s) => s.toggleVersionHistory)
  const loadPage = usePageEditor((s) => s.loadPage)
  const loadVersionSections = usePageEditor((s) => s.loadVersionSections)

  const [versions, setVersions] = useState<VersionListItem[]>([])
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [selectedSections, setSelectedSections] = useState<PageSection[] | null>(null)
  const [diffs, setDiffs] = useState<SectionDiff[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [loadingVersion, setLoadingVersion] = useState(false)

  const secret = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_EDITOR_SECRET ?? '' : ''

  // Fetch version list on mount
  useEffect(() => {
    if (!pageId) return
    setIsLoading(true)
    fetch(`/api/page-editor/${pageId}/versions?limit=20`, {
      headers: { 'x-editor-secret': secret },
    })
      .then((r) => r.json())
      .then((data: { versions: VersionListItem[] }) => {
        setVersions(data.versions ?? [])
      })
      .catch(() => setVersions([]))
      .finally(() => setIsLoading(false))
  }, [pageId, secret])

  // Select a version → fetch full sections → diff
  const handleSelectVersion = useCallback(
    async (versionId: string) => {
      if (!pageId) return
      setSelectedVersionId(versionId)
      setLoadingVersion(true)
      try {
        const res = await fetch(`/api/page-editor/${pageId}/versions/${versionId}`, {
          headers: { 'x-editor-secret': secret },
        })
        const data = (await res.json()) as { version: { sections: PageSection[] } }
        const versionSections = data.version?.sections ?? []
        setSelectedSections(versionSections)
        setDiffs(diffSections(versionSections, sections))
      } catch {
        setSelectedSections(null)
        setDiffs([])
      } finally {
        setLoadingVersion(false)
      }
    },
    [pageId, sections, secret],
  )

  // Restore version via API
  const handleRestore = useCallback(async () => {
    if (!pageId || !selectedVersionId) return
    setIsRestoring(true)
    try {
      await fetch(`/api/page-editor/${pageId}/versions/${selectedVersionId}/restore`, {
        method: 'POST',
        headers: { 'x-editor-secret': secret },
      })
      await loadPage(pageId)
      toggleVersionHistory()
    } catch {
      // silent
    } finally {
      setIsRestoring(false)
    }
  }, [pageId, selectedVersionId, secret, loadPage, toggleVersionHistory])

  // Load version sections into editor (undoable)
  const handleLoadToEditor = useCallback(() => {
    if (!selectedSections) return
    loadVersionSections(selectedSections)
    toggleVersionHistory()
  }, [selectedSections, loadVersionSections, toggleVersionHistory])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleVersionHistory()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleVersionHistory])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-forest-950/85 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) toggleVersionHistory() }}
      role="dialog"
      aria-label="Historia wersji"
    >
      <div className="flex h-[80vh] w-[90vw] max-w-5xl flex-col overflow-hidden rounded-xl border border-forest-700 bg-forest-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-forest-700 px-5 py-3">
          <h2 className="text-sm font-semibold text-cream">
            📋 Historia wersji — &ldquo;{pageTitle}&rdquo;
          </h2>
          <button
            onClick={toggleVersionHistory}
            className="rounded p-1 text-forest-400 transition hover:bg-forest-800 hover:text-cream"
            aria-label="Zamknij"
          >
            ✕
          </button>
        </div>

        {/* Body — split panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: version list */}
          <div className="w-72 shrink-0 overflow-y-auto border-r border-forest-700 p-3">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-forest-800" />
                ))}
              </div>
            ) : versions.length === 0 ? (
              <p className="py-8 text-center text-xs text-forest-500">Brak wersji</p>
            ) : (
              <div className="space-y-1">
                {versions.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => void handleSelectVersion(v.id)}
                    className={`w-full rounded-lg px-3 py-2.5 text-left transition ${
                      selectedVersionId === v.id
                        ? 'bg-accent-warm/15 border border-accent-warm/30'
                        : 'border border-transparent hover:bg-forest-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-accent-warm' : 'bg-forest-600'}`} />
                      <span className="text-xs font-medium text-cream">
                        v{versions.length - i}
                      </span>
                      <span className="text-[10px] text-forest-500">
                        {formatDate(v.createdAt)}
                      </span>
                      {i === 0 && (
                        <span className="rounded bg-accent-warm/20 px-1.5 py-0.5 text-[9px] font-medium text-accent-warm">
                          akt.
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-forest-500">
                      <span>{v.sectionsCount} sekcji</span>
                      <span>· {v.status}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedVersionId && (
              <div className="mt-3 border-t border-forest-700 pt-3 text-[10px] text-forest-500">
                Porównuję: wybrana ↔ aktualna w edytorze
              </div>
            )}
          </div>

          {/* Right: diff view */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4">
              {!selectedVersionId ? (
                <div className="flex h-full items-center justify-center text-sm text-forest-500">
                  ← Wybierz wersję do porównania
                </div>
              ) : loadingVersion ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-forest-800" />
                  ))}
                </div>
              ) : (
                <VersionDiffView diffs={diffs} />
              )}
            </div>

            {/* Actions */}
            {selectedVersionId && selectedSections && (
              <div className="flex items-center gap-2 border-t border-forest-700 px-4 py-3">
                <button
                  onClick={() => void handleRestore()}
                  disabled={isRestoring}
                  className="flex items-center gap-1.5 rounded-lg bg-accent-warm px-3 py-1.5 text-xs font-medium text-forest-950 transition hover:bg-accent-warm-light disabled:opacity-50"
                >
                  {isRestoring ? '⏳' : '🔄'} Przywróć wersję
                </button>
                <button
                  onClick={handleLoadToEditor}
                  className="flex items-center gap-1.5 rounded-lg bg-forest-800 px-3 py-1.5 text-xs font-medium text-cream transition hover:bg-forest-700"
                >
                  📋 Wczytaj sekcje do edytora
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
