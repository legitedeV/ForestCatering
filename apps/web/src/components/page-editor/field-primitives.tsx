'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

// ────────────────────────────────────────────────────────
// Hook: optimistic local state z debounced commit
// ────────────────────────────────────────────────────────

export function useLocalField<T>(storeValue: T, commitFn: (v: T) => void, delay = 400) {
  const [localValue, setLocalValue] = useState(storeValue)
  const commitRef = useRef(commitFn)
  commitRef.current = commitFn
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Sync z zewnątrz (np. undo, load)
  useEffect(() => {
    setLocalValue(storeValue)
  }, [storeValue])

  const handleChange = useCallback(
    (newVal: T) => {
      setLocalValue(newVal)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        commitRef.current(newVal)
      }, delay)
    },
    [delay],
  )

  const localRef = useRef(storeValue)
  localRef.current = localValue

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        commitRef.current(localRef.current)
      }
    }
  }, [])

  return [localValue, handleChange] as const
}

// ────────────────────────────────────────────────────────
// Wspólne style
// ────────────────────────────────────────────────────────

export const inputClasses =
  'w-full rounded-lg bg-forest-800 border border-forest-700 px-3 py-2 text-sm text-cream placeholder:text-forest-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent'
export const labelClasses = 'block text-xs font-medium uppercase tracking-wider text-forest-400 mb-1'

// ────────────────────────────────────────────────────────
// Komponenty pól
// ────────────────────────────────────────────────────────

export function FieldText({
  label,
  value,
  onCommit,
  type = 'text',
}: {
  label: string
  value: string
  onCommit: (v: string) => void
  type?: string
}) {
  const [local, setLocal] = useLocalField(value ?? '', onCommit)
  return (
    <label className="block">
      <span className={labelClasses}>{label}</span>
      <input
        type={type}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        className={inputClasses}
      />
    </label>
  )
}

export function FieldTextarea({
  label,
  value,
  onCommit,
}: {
  label: string
  value: string
  onCommit: (v: string) => void
}) {
  const [local, setLocal] = useLocalField(value ?? '', onCommit)
  return (
    <label className="block">
      <span className={labelClasses}>{label}</span>
      <textarea
        rows={3}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        className={inputClasses + ' resize-y'}
      />
    </label>
  )
}

export function FieldNumber({
  label,
  value,
  onCommit,
}: {
  label: string
  value: number
  onCommit: (v: number) => void
}) {
  const [local, setLocal] = useLocalField(value ?? 0, onCommit)
  return (
    <label className="block">
      <span className={labelClasses}>{label}</span>
      <input
        type="number"
        value={local}
        onChange={(e) => setLocal(Number(e.target.value))}
        className={inputClasses}
      />
    </label>
  )
}

export function FieldToggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-2">
      <span className={labelClasses + ' mb-0'}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${
          checked ? 'bg-accent' : 'bg-forest-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-cream transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}

export function FieldSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (v: string) => void
}) {
  return (
    <label className="block">
      <span className={labelClasses}>{label}</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={inputClasses}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}
