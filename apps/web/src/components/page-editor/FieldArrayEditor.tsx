'use client'

import { useState } from 'react'
import { usePageEditor } from '@/lib/page-editor-store'
import {
  FieldText,
  FieldTextarea,
  FieldNumber,
  FieldToggle,
  labelClasses,
} from './field-primitives'

// ────────────────────────────────────────────────────────
// Typy
// ────────────────────────────────────────────────────────

export interface ArrayFieldConfig {
  name: string       // nazwa pola w bloku (np. "items", "packages", "steps", "cards")
  label: string      // etykieta PL (np. "Pytania FAQ")
  itemLabel: string  // etykieta pojedynczego itemu (np. "Pytanie")
  maxItems?: number
  fields: Array<{
    key: string      // klucz w obiekcie itemu (np. "question")
    label: string    // etykieta PL
    type: 'text' | 'textarea' | 'number' | 'toggle'
  }>
}

// ────────────────────────────────────────────────────────
// Komponent
// ────────────────────────────────────────────────────────

export function FieldArrayEditor({
  config,
  blockIndex,
}: {
  config: ArrayFieldConfig
  blockIndex: number
}) {
  const sections = usePageEditor((s) => s.sections)
  const updateBlockField = usePageEditor((s) => s.updateBlockField)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const block = sections[blockIndex] as Record<string, unknown> | undefined
  if (!block) return null

  const items = (block[config.name] as Array<Record<string, unknown>>) ?? []

  // ── Handlers ──

  const handleFieldCommit = (itemIndex: number, fieldKey: string, value: unknown) => {
    updateBlockField(blockIndex, `${config.name}.${itemIndex}.${fieldKey}`, value)
  }

  const handleAdd = () => {
    if (config.maxItems && items.length >= config.maxItems) return
    const newItem: Record<string, unknown> = { id: crypto.randomUUID() }
    for (const f of config.fields) {
      if (f.type === 'number') newItem[f.key] = 0
      else if (f.type === 'toggle') newItem[f.key] = false
      else newItem[f.key] = ''
    }
    updateBlockField(blockIndex, config.name, [...items, newItem])
    setExpandedIndex(items.length)
  }

  const handleRemove = (itemIndex: number) => {
    if (!window.confirm(`Usunąć ${config.itemLabel} #${itemIndex + 1}?`)) return
    const newItems = items.filter((_, i) => i !== itemIndex)
    updateBlockField(blockIndex, config.name, newItems)
    if (expandedIndex === itemIndex) setExpandedIndex(null)
    else if (expandedIndex !== null && expandedIndex > itemIndex) setExpandedIndex(expandedIndex - 1)
  }

  const handleMoveUp = (itemIndex: number) => {
    if (itemIndex === 0) return
    const newItems = [...items]
    ;[newItems[itemIndex - 1], newItems[itemIndex]] = [newItems[itemIndex], newItems[itemIndex - 1]]
    updateBlockField(blockIndex, config.name, newItems)
    if (expandedIndex === itemIndex) setExpandedIndex(itemIndex - 1)
    else if (expandedIndex === itemIndex - 1) setExpandedIndex(itemIndex)
  }

  const handleMoveDown = (itemIndex: number) => {
    if (itemIndex >= items.length - 1) return
    const newItems = [...items]
    ;[newItems[itemIndex], newItems[itemIndex + 1]] = [newItems[itemIndex + 1], newItems[itemIndex]]
    updateBlockField(blockIndex, config.name, newItems)
    if (expandedIndex === itemIndex) setExpandedIndex(itemIndex + 1)
    else if (expandedIndex === itemIndex + 1) setExpandedIndex(itemIndex)
  }

  // Derive a preview label from the first text field
  const getItemPreview = (item: Record<string, unknown>) => {
    const firstTextField = config.fields.find((f) => f.type === 'text' || f.type === 'textarea')
    if (!firstTextField) return ''
    const val = item[firstTextField.key]
    if (typeof val === 'string' && val.length > 0) {
      return val.length > 40 ? val.slice(0, 40) + '…' : val
    }
    return ''
  }

  // ── Render ──

  return (
    <div className="space-y-2">
      <span className={labelClasses}>{config.label}</span>

      {items.length === 0 && (
        <p className="text-xs text-forest-500 italic">Brak elementów</p>
      )}

      {items.map((item, i) => {
        const isExpanded = expandedIndex === i
        const preview = getItemPreview(item)
        return (
          <div
            key={(item.id as string) ?? i}
            className="rounded-lg border border-forest-700 bg-forest-800/50 overflow-hidden"
          >
            {/* Item header */}
            <div className="flex items-center gap-1 px-2 py-1.5">
              {/* Reorder buttons */}
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => handleMoveUp(i)}
                  disabled={i === 0}
                  className="text-[10px] leading-none text-forest-400 hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Przesuń w górę"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(i)}
                  disabled={i === items.length - 1}
                  className="text-[10px] leading-none text-forest-400 hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Przesuń w dół"
                >
                  ▼
                </button>
              </div>

              {/* Expand toggle */}
              <button
                type="button"
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                className="flex-1 text-left flex items-center gap-1.5 min-w-0"
              >
                <span className="text-[10px] text-forest-500 shrink-0">#{i + 1}</span>
                <span className="text-xs text-cream truncate">
                  {preview || <span className="italic text-forest-500">{config.itemLabel}</span>}
                </span>
                <span className="ml-auto text-[10px] text-forest-500 shrink-0">
                  {isExpanded ? '▾' : '▸'}
                </span>
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="text-xs text-forest-500 hover:text-red-400 shrink-0 px-1"
                title={`Usuń ${config.itemLabel}`}
              >
                🗑️
              </button>
            </div>

            {/* Expanded fields */}
            {isExpanded && (
              <div className="space-y-2 px-2 pb-2 border-t border-forest-700 pt-2">
                {config.fields.map((field) => {
                  const val = item[field.key]
                  if (field.type === 'text') {
                    return (
                      <FieldText
                        key={field.key}
                        label={field.label}
                        value={(val as string) ?? ''}
                        onCommit={(v) => handleFieldCommit(i, field.key, v)}
                      />
                    )
                  }
                  if (field.type === 'textarea') {
                    return (
                      <FieldTextarea
                        key={field.key}
                        label={field.label}
                        value={(val as string) ?? ''}
                        onCommit={(v) => handleFieldCommit(i, field.key, v)}
                      />
                    )
                  }
                  if (field.type === 'number') {
                    return (
                      <FieldNumber
                        key={field.key}
                        label={field.label}
                        value={typeof val === 'number' ? val : 0}
                        onCommit={(v) => handleFieldCommit(i, field.key, v)}
                      />
                    )
                  }
                  if (field.type === 'toggle') {
                    return (
                      <FieldToggle
                        key={field.key}
                        label={field.label}
                        checked={!!val}
                        onChange={(v) => handleFieldCommit(i, field.key, v)}
                      />
                    )
                  }
                  return null
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Add button */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={!!config.maxItems && items.length >= config.maxItems}
        className="w-full rounded-lg border border-dashed border-forest-600 px-3 py-2 text-xs text-forest-400 hover:border-accent hover:text-accent transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ➕ Dodaj {config.itemLabel}
      </button>
    </div>
  )
}
