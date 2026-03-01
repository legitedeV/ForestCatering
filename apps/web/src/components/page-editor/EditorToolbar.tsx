'use client'

import { usePageEditor } from '@/lib/page-editor-store'

// Ikony SVG breakpointów
function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  )
}

function TabletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M12 18h.01" />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 18h.01" />
    </svg>
  )
}

// Spinner do stanu ładowania
function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

const BREAKPOINTS = [
  { key: 'desktop' as const, label: 'Desktop', Icon: MonitorIcon },
  { key: 'tablet' as const, label: 'Tablet', Icon: TabletIcon },
  { key: 'mobile' as const, label: 'Mobile', Icon: PhoneIcon },
]

export function EditorToolbar() {
  const pageId = usePageEditor((s) => s.pageId)
  const pageTitle = usePageEditor((s) => s.pageTitle)
  const pagePath = usePageEditor((s) => s.pagePath)
  const isDirty = usePageEditor((s) => s.isDirty)
  const isSaving = usePageEditor((s) => s.isSaving)
  const previewBreakpoint = usePageEditor((s) => s.previewBreakpoint)
  const setPreviewBreakpoint = usePageEditor((s) => s.setPreviewBreakpoint)
  const savePage = usePageEditor((s) => s.savePage)

  return (
    <header
      className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-forest-800 bg-forest-950/95 px-4 backdrop-blur-md"
      role="toolbar"
      aria-label="Pasek narzędzi edytora"
    >
      {/* Lewo — link powrotny, tytuł, ścieżka */}
      <div className="flex items-center gap-3 overflow-hidden">
        <a
          href={pageId ? `/admin/collections/pages/${pageId}` : '/admin'}
          className="shrink-0 text-forest-400 transition hover:text-cream"
          aria-label="Powrót do Payload Admin"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </a>
        <span className="truncate text-sm font-semibold text-cream">{pageTitle || 'Edytor strony'}</span>
        {pagePath && (
          <span className="hidden shrink-0 rounded bg-forest-800 px-2 py-0.5 text-xs text-forest-400 sm:inline-block">
            /{pagePath}
          </span>
        )}
      </div>

      {/* Środek — breakpoint selector */}
      <div className="flex items-center gap-1 rounded-lg bg-forest-900 p-1" role="radiogroup" aria-label="Breakpoint podglądu">
        {BREAKPOINTS.map(({ key, label, Icon }) => (
          <button
            key={key}
            role="radio"
            aria-checked={previewBreakpoint === key}
            aria-label={label}
            onClick={() => setPreviewBreakpoint(key)}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
              previewBreakpoint === key
                ? 'bg-accent text-forest-950'
                : 'text-forest-400 hover:text-cream'
            }`}
          >
            <Icon className="inline-block" />
          </button>
        ))}
      </div>

      {/* Prawo — dirty badge, save, preview */}
      <div className="flex items-center gap-2">
        {isDirty && (
          <span className="animate-pulse rounded-full bg-orange-600/20 px-2.5 py-0.5 text-xs font-medium text-orange-400">
            Niezapisane zmiany
          </span>
        )}
        <button
          onClick={() => void savePage()}
          disabled={isSaving || !isDirty}
          className="flex items-center gap-1.5 rounded-lg bg-forest-800 px-3 py-1.5 text-xs font-medium text-cream transition hover:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zapisz draft (Ctrl+S)"
          aria-label="Zapisz draft"
        >
          {isSaving ? <Spinner /> : null}
          {isSaving ? 'Zapisuję...' : 'Zapisz draft'}
        </button>
        <a
          href={pagePath ? `/${pagePath}` : '/'}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-forest-950 transition hover:bg-accent-light"
          aria-label="Podgląd strony"
        >
          Podgląd
        </a>
      </div>
    </header>
  )
}
