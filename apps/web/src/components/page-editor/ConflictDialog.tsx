'use client'

import { usePageEditor } from '@/lib/page-editor-store'

export function ConflictDialog() {
  const lastKnownUpdatedAt = usePageEditor((s) => s.lastKnownUpdatedAt)
  const serverUpdatedAt = usePageEditor((s) => s.serverUpdatedAt)
  const resolveConflict = usePageEditor((s) => s.resolveConflict)
  const dismissConflict = usePageEditor((s) => s.dismissConflict)

  return (
    <div className="conflict-backdrop" role="alertdialog" aria-label="Konflikt zapisu">
      <div className="w-full max-w-md rounded-xl border border-forest-700 bg-forest-900 p-6 shadow-2xl">
        <h2 className="text-base font-semibold text-cream">
          ⚠️ Konflikt zapisu
        </h2>

        <p className="mt-3 text-sm text-forest-300">
          Strona została zmodyfikowana w innej sesji od Twojego ostatniego pobrania.
        </p>

        <div className="mt-4 space-y-1 text-xs text-forest-400">
          <p>Twoja wersja: <span className="text-cream">{lastKnownUpdatedAt ?? '—'}</span></p>
          <p>Serwer: <span className="text-cream">{serverUpdatedAt ?? '—'}</span></p>
        </div>

        <div className="mt-6 space-y-2">
          <button
            onClick={() => void resolveConflict('reload')}
            className="flex w-full items-center gap-2 rounded-lg bg-forest-800 px-4 py-2.5 text-sm text-cream transition hover:bg-forest-700"
          >
            <span>🔄</span>
            <div className="text-left">
              <div className="font-medium">Przeładuj z serwera</div>
              <div className="text-xs text-forest-400">Porzucisz lokalne zmiany</div>
            </div>
          </button>

          <button
            onClick={() => void resolveConflict('overwrite')}
            className="flex w-full items-center gap-2 rounded-lg bg-accent-warm/10 px-4 py-2.5 text-sm text-cream transition hover:bg-accent-warm/20"
          >
            <span>💾</span>
            <div className="text-left">
              <div className="font-medium">Nadpisz serwerową wersję</div>
              <div className="text-xs text-forest-400">Twoje zmiany zastąpią serwerowe</div>
            </div>
          </button>

          <button
            onClick={dismissConflict}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-forest-700 px-4 py-2 text-sm text-forest-400 transition hover:bg-forest-800 hover:text-cream"
          >
            ❌ Anuluj
          </button>
        </div>
      </div>
    </div>
  )
}
