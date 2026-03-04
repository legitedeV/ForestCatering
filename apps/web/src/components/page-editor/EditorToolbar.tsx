'use client'

import { usePageEditor } from '@/lib/page-editor-store'
import { HistoryPanel } from './HistoryPanel'
import { ShortcutsPanel } from './ShortcutsPanel'

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

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
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

function UndoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" /><path d="M3 13a9 9 0 0 1 15.36-6.36L21 9" />
    </svg>
  )
}

function RedoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 7v6h-6" /><path d="M21 13a9 9 0 0 0-15.36-6.36L3 9" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /><path d="M22 12A10 10 0 0 0 12 2" strokeDasharray="4 2" />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
  const gridVisible = usePageEditor((s) => s.gridVisible)
  const gridColumns = usePageEditor((s) => s.gridColumns)
  const gridShowRulers = usePageEditor((s) => s.gridShowRulers)
  const toggleGrid = usePageEditor((s) => s.toggleGrid)
  const setGridColumns = usePageEditor((s) => s.setGridColumns)
  const toggleRulers = usePageEditor((s) => s.toggleRulers)
  const spacingInspectorEnabled = usePageEditor((s) => s.spacingInspectorEnabled)
  const toggleSpacingInspector = usePageEditor((s) => s.toggleSpacingInspector)
  const undo = usePageEditor((s) => s.undo)
  const redo = usePageEditor((s) => s.redo)
  const canUndo = usePageEditor((s) => s.canUndo)
  const canRedo = usePageEditor((s) => s.canRedo)
  const undoStack = usePageEditor((s) => s.undoStack)
  const redoStack = usePageEditor((s) => s.redoStack)
  const historyPanelOpen = usePageEditor((s) => s.historyPanelOpen)
  const toggleHistoryPanel = usePageEditor((s) => s.toggleHistoryPanel)
  const toggleVersionHistory = usePageEditor((s) => s.toggleVersionHistory)
  const showComments = usePageEditor((s) => s.showComments)
  const toggleComments = usePageEditor((s) => s.toggleComments)
  const blockComments = usePageEditor((s) => s.blockComments)
  const unresolvedCount = blockComments.filter((c) => !c.resolved).length
  const shortcutsOpen = usePageEditor((s) => s.shortcutsOpen)
  const toggleShortcuts = usePageEditor((s) => s.toggleShortcuts)
  const splitPreviewEnabled = usePageEditor((s) => s.splitPreviewEnabled)
  const toggleSplitPreview = usePageEditor((s) => s.toggleSplitPreview)
  const a11yPanelOpen = usePageEditor((s) => s.a11yPanelOpen)
  const toggleA11yPanel = usePageEditor((s) => s.toggleA11yPanel)

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

        {/* Undo/Redo/History cluster */}
        <div className="relative flex items-center gap-0.5 border-l border-forest-700 pl-2 ml-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="rounded p-1.5 text-forest-400 transition hover:bg-forest-800 hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Cofnij (Ctrl+Z)"
            title={canUndo && undoStack.length > 0
              ? `Cofnij: ${undoStack[undoStack.length - 1].label}`
              : 'Cofnij (Ctrl+Z)'}
          >
            <UndoIcon />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="rounded p-1.5 text-forest-400 transition hover:bg-forest-800 hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Ponów (Ctrl+Shift+Z)"
            title={canRedo && redoStack.length > 0
              ? `Ponów: ${redoStack[redoStack.length - 1].label}`
              : 'Ponów (Ctrl+Shift+Z)'}
          >
            <RedoIcon />
          </button>
          <button
            onClick={toggleHistoryPanel}
            className={`rounded p-1.5 transition ${historyPanelOpen
              ? 'bg-accent/20 text-accent'
              : 'text-forest-400 hover:bg-forest-800 hover:text-cream'}`}
            aria-label="Historia zmian sesji"
            title="Historia zmian sesji"
          >
            <HistoryIcon />
          </button>
          {historyPanelOpen && <HistoryPanel />}
        </div>

        {/* Version history & comments */}
        <div className="flex items-center gap-0.5 border-l border-forest-700 pl-2 ml-2">
          <button
            onClick={toggleVersionHistory}
            className="rounded p-1.5 text-forest-400 transition hover:bg-forest-800 hover:text-cream"
            aria-label="Historia wersji (Payload)"
            title="Historia wersji"
          >
            <ClockIcon />
          </button>
          <button
            onClick={toggleComments}
            className={`relative rounded p-1.5 transition ${showComments
              ? 'bg-accent-warm/20 text-accent-warm'
              : 'text-forest-400 hover:bg-forest-800 hover:text-cream'}`}
            aria-label={showComments ? 'Ukryj komentarze' : 'Pokaż komentarze'}
            title="Komentarze"
          >
            <CommentIcon />
            {unresolvedCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent-warm text-[8px] font-bold text-forest-950">
                {unresolvedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Środek — breakpoint selector + grid/inspector toggles */}
      <div className="flex items-center gap-2">
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

        {/* Grid toggle */}
        <button
          onClick={toggleGrid}
          className={`rounded-md px-2 py-1.5 text-xs font-medium transition ${
            gridVisible ? 'bg-accent-warm text-forest-950' : 'bg-forest-900 text-forest-400 hover:text-cream'
          }`}
          title="Siatka (Ctrl+G)"
          aria-label="Przełącz siatkę"
          aria-pressed={gridVisible}
        >
          <GridIcon className="inline-block" />
        </button>

        {/* Grid config dropdown */}
        {gridVisible && (
          <div className="flex items-center gap-1 rounded-lg bg-forest-900 p-1">
            {([12, 16, 24] as const).map((cols) => (
              <button
                key={cols}
                onClick={() => setGridColumns(cols)}
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition ${
                  gridColumns === cols ? 'bg-accent-warm text-forest-950' : 'text-forest-500 hover:text-cream'
                }`}
                aria-label={`${cols} kolumn`}
              >
                {cols}
              </button>
            ))}
            <button
              onClick={toggleRulers}
              className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition ${
                gridShowRulers ? 'bg-accent-warm/30 text-accent-warm' : 'text-forest-500 hover:text-cream'
              }`}
              title="Linijki"
              aria-label="Przełącz linijki"
              aria-pressed={gridShowRulers}
            >
              📏
            </button>
          </div>
        )}

        {/* Spacing inspector toggle */}
        <button
          onClick={toggleSpacingInspector}
          className={`rounded-md px-2 py-1.5 text-xs font-medium transition ${
            spacingInspectorEnabled ? 'bg-accent-warm text-forest-950' : 'bg-forest-900 text-forest-400 hover:text-cream'
          }`}
          title="Inspektor odstępów"
          aria-label="Przełącz inspektor odstępów"
          aria-pressed={spacingInspectorEnabled}
        >
          📐
        </button>

        {/* Split preview toggle */}
        <button
          onClick={toggleSplitPreview}
          className={`rounded-md px-2 py-1.5 text-xs font-medium transition ${
            splitPreviewEnabled ? 'bg-accent-warm text-forest-950' : 'bg-forest-900 text-forest-400 hover:text-cream'
          }`}
          title="Podgląd wielourządzeniowy"
          aria-label="Przełącz podgląd wielourządzeniowy"
          aria-pressed={splitPreviewEnabled}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
            <rect x="1" y="3" width="6" height="18" rx="1" /><rect x="9" y="3" width="6" height="18" rx="1" /><rect x="17" y="3" width="6" height="18" rx="1" />
          </svg>
        </button>

        {/* A11y audit button */}
        <button
          onClick={toggleA11yPanel}
          className={`rounded-md px-2 py-1.5 text-xs font-medium transition ${
            a11yPanelOpen ? 'bg-accent-warm text-forest-950' : 'bg-forest-900 text-forest-400 hover:text-cream'
          }`}
          title="Audyt dostępności"
          aria-label="Audyt dostępności"
          aria-pressed={a11yPanelOpen}
        >
          ♿
        </button>
      </div>

      {/* Prawo — dirty badge, save, preview */}
      <div className="flex items-center gap-2">
        {isDirty && (
          <span className="animate-pulse rounded-full bg-orange-600/20 px-2.5 py-0.5 text-xs font-medium text-orange-400">
            Niezapisane zmiany
          </span>
        )}
        {/* Shortcuts button */}
        <button
          onClick={toggleShortcuts}
          className={`rounded-md px-2 py-1.5 text-xs transition ${
            shortcutsOpen
              ? 'bg-accent/20 text-accent'
              : 'bg-forest-900 text-forest-400 hover:text-cream'
          }`}
          aria-label="Skróty klawiszowe (?)"
          title="Skróty klawiszowe (?)"
        >
          ⌨️
        </button>
        <button
          onClick={() => void savePage()}
          disabled={isSaving || !isDirty}
          className="flex items-center gap-1.5 rounded-lg bg-forest-800 px-3 py-1.5 text-xs font-medium text-cream transition hover:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zapisz (Ctrl+S)"
          aria-label="Zapisz"
        >
          {isSaving ? <Spinner /> : null}
          {isSaving ? 'Zapisuję...' : 'Zapisz'}
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
      <ShortcutsPanel />
    </header>
  )
}
