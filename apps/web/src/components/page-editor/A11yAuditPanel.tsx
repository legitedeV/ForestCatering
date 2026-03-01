'use client'

import { useState } from 'react'
import { usePageEditor } from '@/lib/page-editor-store'
import type { A11yIssue } from '@/lib/a11y-checks'

const SEVERITY_CONFIG = {
  error: { label: 'Błędy', color: 'text-red-400', bg: 'bg-red-400/10', badge: 'bg-red-500' },
  warning: { label: 'Ostrzeżenia', color: 'text-yellow-400', bg: 'bg-yellow-400/10', badge: 'bg-yellow-500' },
  info: { label: 'Informacje', color: 'text-blue-400', bg: 'bg-blue-400/10', badge: 'bg-blue-500' },
}

export function A11yAuditPanel() {
  const a11yPanelOpen = usePageEditor((s) => s.a11yPanelOpen)
  const a11yIssues = usePageEditor((s) => s.a11yIssues)
  const toggleA11yPanel = usePageEditor((s) => s.toggleA11yPanel)
  const selectBlock = usePageEditor((s) => s.selectBlock)
  const [isRunning, setIsRunning] = useState(false)

  if (!a11yPanelOpen) return null

  const runAudit = () => {
    setIsRunning(true)
    // Send message to preview iframe to run audit
    const iframe = document.querySelector('iframe[title="Podgląd strony"]') as HTMLIFrameElement | null
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'editor:run-a11y-audit' }, '*')
    }
    // The result will come back via postMessage and be set via store
    setTimeout(() => setIsRunning(false), 1000)
  }

  const errors = a11yIssues.filter((i) => i.severity === 'error')
  const warnings = a11yIssues.filter((i) => i.severity === 'warning')
  const infos = a11yIssues.filter((i) => i.severity === 'info')

  const groups = [
    { severity: 'error' as const, items: errors },
    { severity: 'warning' as const, items: warnings },
    { severity: 'info' as const, items: infos },
  ].filter((g) => g.items.length > 0)

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-96 flex-col border-l border-forest-700 bg-forest-950/98 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-forest-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-cream">♿ Audyt dostępności</span>
          {a11yIssues.length > 0 && (
            <span className="rounded-full bg-forest-800 px-2 py-0.5 text-[10px] font-medium text-forest-300">
              {a11yIssues.length}
            </span>
          )}
        </div>
        <button
          onClick={toggleA11yPanel}
          className="rounded p-1 text-forest-400 transition hover:bg-forest-800 hover:text-cream"
          aria-label="Zamknij panel"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Run audit button */}
        <button
          onClick={runAudit}
          disabled={isRunning}
          className="mb-4 w-full rounded-lg bg-forest-800 py-2 text-xs font-medium text-cream transition hover:bg-forest-700 disabled:opacity-50"
        >
          {isRunning ? '⏳ Analizowanie…' : '▶ Uruchom ponownie'}
        </button>

        {/* No issues */}
        {a11yIssues.length === 0 && !isRunning && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="text-3xl">✅</span>
            <p className="mt-2 text-sm text-forest-400">Brak problemów z dostępnością</p>
          </div>
        )}

        {/* Grouped issues */}
        {groups.map(({ severity, items }) => {
          const config = SEVERITY_CONFIG[severity]
          return (
            <div key={severity} className="mb-4">
              <h3 className={`mb-2 flex items-center gap-1.5 text-xs font-semibold ${config.color}`}>
                <span className={`inline-block h-2 w-2 rounded-full ${config.badge}`} />
                {config.label} ({items.length})
              </h3>
              <ul className="space-y-1.5">
                {items.map((issue: A11yIssue, i: number) => (
                  <li
                    key={`${severity}-${i}`}
                    className={`rounded-md ${config.bg} p-2 ${issue.blockIndex !== undefined ? 'cursor-pointer hover:ring-1 hover:ring-forest-600' : ''}`}
                    onClick={() => {
                      if (issue.blockIndex !== undefined) selectBlock(issue.blockIndex)
                    }}
                  >
                    <p className="text-xs text-cream/90">{issue.message}</p>
                    {issue.element && (
                      <p className="mt-0.5 truncate text-[10px] font-mono text-forest-500">{issue.element}</p>
                    )}
                    {issue.blockIndex !== undefined && (
                      <p className="mt-0.5 text-[10px] text-forest-500">Blok #{issue.blockIndex + 1}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
