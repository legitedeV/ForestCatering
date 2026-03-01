'use client'

import { useState } from 'react'
import type { SectionDiff } from '@/lib/section-diff'
import { getBlockMeta } from '@/lib/block-metadata'

const DIFF_COLORS: Record<string, string> = {
  added: 'diff-added',
  removed: 'diff-removed',
  modified: 'diff-modified',
  moved: 'diff-moved',
  unchanged: 'diff-unchanged',
}

const DIFF_ICONS: Record<string, string> = {
  added: '🟢 +',
  removed: '🔴 −',
  modified: '🟡 ~',
  moved: '🔵 ↕',
  unchanged: '⚪ =',
}

const DIFF_LABELS: Record<string, string> = {
  added: 'Dodany',
  removed: 'Usunięty',
  modified: 'Zmieniony',
  moved: 'Przesunięty',
  unchanged: 'Bez zmian',
}

function truncateValue(value: unknown, max = 100): string {
  if (value === undefined) return '(brak)'
  if (value === null) return 'null'
  if (typeof value === 'string') return value.length > max ? value.slice(0, max) + '…' : value
  const str = JSON.stringify(value)
  return str.length > max ? str.slice(0, max) + '…' : str
}

function DiffItem({ diff }: { diff: SectionDiff }) {
  const [expanded, setExpanded] = useState(diff.type !== 'unchanged')
  const meta = getBlockMeta(diff.blockType)
  const hasFields = diff.changedFields && diff.changedFields.length > 0

  return (
    <div className={`rounded-md px-3 py-2 ${DIFF_COLORS[diff.type] ?? ''}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 text-left text-sm"
        aria-expanded={expanded}
      >
        <span className="shrink-0 text-xs font-mono">{DIFF_ICONS[diff.type]}</span>
        <span className="text-base">{meta?.icon ?? '📦'}</span>
        <span className="font-medium text-cream">
          {meta?.label ?? diff.blockType} #{diff.index + 1}
        </span>
        <span className="text-xs text-forest-400">({DIFF_LABELS[diff.type]})</span>
        {diff.type === 'moved' && diff.oldIndex !== undefined && (
          <span className="text-xs text-forest-500">
            #{diff.oldIndex + 1} → #{diff.index + 1}
          </span>
        )}
        {hasFields && (
          <span className="ml-auto text-xs text-forest-500">
            {expanded ? '▼' : '▶'} {diff.changedFields!.length} pól
          </span>
        )}
      </button>

      {expanded && hasFields && (
        <div className="mt-2 space-y-1 border-t border-forest-700/50 pt-2">
          {diff.changedFields!.map((field, i) => (
            <div key={i} className="text-xs">
              <span className="font-medium text-forest-300">{field.fieldPath}:</span>{' '}
              {field.type === 'added' ? (
                <span className="diff-field-new">{truncateValue(field.newValue)}</span>
              ) : field.type === 'removed' ? (
                <span className="diff-field-old">{truncateValue(field.oldValue)}</span>
              ) : (
                <>
                  <span className="diff-field-old">{truncateValue(field.oldValue)}</span>
                  {' → '}
                  <span className="diff-field-new">{truncateValue(field.newValue)}</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface VersionDiffViewProps {
  diffs: SectionDiff[]
}

export function VersionDiffView({ diffs }: VersionDiffViewProps) {
  if (diffs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-forest-500">
        Brak różnic — wersje są identyczne
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {diffs.map((diff, i) => (
        <DiffItem key={i} diff={diff} />
      ))}

      <div className="mt-4 flex items-center gap-4 border-t border-forest-700/50 pt-3 text-[10px] text-forest-500">
        <span>🟢 + dodane</span>
        <span>🔴 − usunięte</span>
        <span>🟡 ~ zmienione</span>
        <span>🔵 ↕ przesunięte</span>
        <span>⚪ = bez zmian</span>
      </div>
    </div>
  )
}
