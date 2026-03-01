'use client'

import { usePageEditor } from '@/lib/page-editor-store'
import { KEYBOARD_SHORTCUTS, SHORTCUT_CATEGORY_LABELS } from '@/lib/keyboard-shortcuts-catalog'

function KbdKey({ label }: { label: string }) {
  return (
    <kbd className="inline-flex items-center justify-center rounded border border-forest-600 bg-forest-800 px-1.5 py-0.5 text-[10px] font-mono text-cream/80 shadow-sm">
      {label}
    </kbd>
  )
}

export function ShortcutsPanel() {
  const shortcutsOpen = usePageEditor((s) => s.shortcutsOpen)
  const toggleShortcuts = usePageEditor((s) => s.toggleShortcuts)

  if (!shortcutsOpen) return null

  const categories = [...new Set(KEYBOARD_SHORTCUTS.map((s) => s.category))]

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Skróty klawiszowe"
      onClick={(e) => {
        if (e.target === e.currentTarget) toggleShortcuts()
      }}
    >
      <div className="w-full max-w-lg rounded-xl border border-forest-700 bg-forest-950 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-cream">⌨️ Skróty klawiszowe</h2>
          <button
            onClick={toggleShortcuts}
            className="rounded-md p-1.5 text-forest-400 transition hover:bg-forest-800 hover:text-cream"
            aria-label="Zamknij"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Shortcut groups */}
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-forest-500">
                {SHORTCUT_CATEGORY_LABELS[cat] ?? cat}
              </p>
              <div className="space-y-1">
                {KEYBOARD_SHORTCUTS.filter((s) => s.category === cat).map((shortcut) => (
                  <div
                    key={shortcut.id}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-forest-900"
                  >
                    <span className="text-sm text-cream/80">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <KbdKey label={key} />
                          {i < shortcut.keys.length - 1 && (
                            <span className="text-[10px] text-forest-500">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-[11px] text-forest-500">
          Naciśnij <KbdKey label="?" /> lub <KbdKey label="Escape" /> aby zamknąć
        </p>
      </div>
    </div>
  )
}
