'use client'

import { useState } from 'react'

export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-forest-800 pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-medium text-cream"
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="text-forest-500 text-xs">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="mt-2 space-y-2">{children}</div>}
    </div>
  )
}
