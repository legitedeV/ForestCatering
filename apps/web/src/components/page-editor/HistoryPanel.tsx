'use client'

import { usePageEditor } from '@/lib/page-editor-store'
import type { EditorCommandType } from '@/lib/undo-redo-engine'

const COMMAND_ICONS: Record<EditorCommandType, string> = {
  moveBlock: '🔀',
  removeBlock: '🗑️',
  duplicateBlock: '📋',
  addBlock: '➕',
  updateBlockField: '✏️',
  reorderBlocks: '🔀',
  batch: '📦',
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const seconds = Math.floor(diff / 1000)
  if (seconds < 10) return 'teraz'
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return 'wczoraj'
}

export function HistoryPanel() {
  const undoStack = usePageEditor((s) => s.undoStack)
  const redoStack = usePageEditor((s) => s.redoStack)
  const undoToIndex = usePageEditor((s) => s.undoToIndex)
  const redoToIndex = usePageEditor((s) => s.redoToIndex)
  const clearHistory = usePageEditor((s) => s.clearHistory)

  const reversedUndo = [...undoStack].reverse()

  return (
    <div className="absolute right-0 top-full mt-1 z-50 w-80 rounded-lg border border-forest-700 bg-forest-900 shadow-2xl">
      {/* Nagłówek */}
      <div className="flex items-center gap-2 border-b border-forest-700 px-3 py-2">
        <span className="text-sm font-medium text-cream">📜 Historia zmian</span>
      </div>

      {/* Lista */}
      <div className="max-h-80 overflow-y-auto">
        {/* Undo stack (od najnowszej) */}
        {reversedUndo.length > 0 && (
          <div className="border-b border-forest-800 py-1">
            {reversedUndo.map((cmd, displayIndex) => {
              const stackIndex = undoStack.length - 1 - displayIndex
              return (
                <button
                  key={`undo-${stackIndex}-${cmd.timestamp}`}
                  onClick={() => undoToIndex(stackIndex)}
                  className={`history-item flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                    displayIndex === 0
                      ? 'history-item-current font-medium text-cream'
                      : 'text-forest-300'
                  }`}
                  title={cmd.label}
                >
                  <span className="shrink-0 text-xs">{COMMAND_ICONS[cmd.type] ?? '●'}</span>
                  <span className="truncate">{cmd.label}</span>
                  <span className="ml-auto shrink-0 text-[10px] text-forest-500">
                    {formatRelativeTime(cmd.timestamp)}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Redo stack (cofnięte) */}
        {redoStack.length > 0 && (
          <div className="py-1">
            <div className="px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-forest-500">
              Cofnięte (redo)
            </div>
            {redoStack.map((cmd, index) => (
              <button
                key={`redo-${index}-${cmd.timestamp}`}
                onClick={() => redoToIndex(index + 1)}
                className="history-item history-item-redo flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-forest-400"
                title={cmd.label}
              >
                <span className="shrink-0 text-xs">{COMMAND_ICONS[cmd.type] ?? '○'}</span>
                <span className="truncate">{cmd.label}</span>
                <span className="ml-auto shrink-0 text-[10px] text-forest-500">redo</span>
              </button>
            ))}
          </div>
        )}

        {/* Pusta historia */}
        {undoStack.length === 0 && redoStack.length === 0 && (
          <div className="px-3 py-6 text-center text-xs text-forest-500">
            Brak zmian w tej sesji
          </div>
        )}
      </div>

      {/* Stopka */}
      <div className="border-t border-forest-700 px-3 py-2">
        <div className="mb-2 text-[10px] text-forest-500">
          {undoStack.length} zmian · 100 max
        </div>
        <button
          onClick={clearHistory}
          disabled={undoStack.length === 0 && redoStack.length === 0}
          className="w-full rounded-lg border border-forest-700 bg-forest-800 py-2 text-xs text-forest-400 transition hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed"
        >
          🗑️ Wyczyść historię
        </button>
      </div>
    </div>
  )
}
