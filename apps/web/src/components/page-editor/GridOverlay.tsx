'use client'

import { useMemo } from 'react'
import { usePageEditor } from '@/lib/page-editor-store'

const GRID_MAX_WIDTH = 1280
const RULER_SIZE = 20

function RulerH() {
  const ticks = useMemo(() => {
    const arr: number[] = []
    for (let i = 0; i <= GRID_MAX_WIDTH; i += 100) arr.push(i)
    return arr
  }, [])

  return (
    <div className="editor-ruler editor-ruler-h flex items-end overflow-hidden text-[8px] text-forest-500">
      {ticks.map((px) => (
        <span
          key={px}
          className="absolute border-l border-forest-600"
          style={{ left: px, height: '100%', paddingLeft: 2 }}
        >
          {px}
        </span>
      ))}
    </div>
  )
}

function RulerV() {
  const ticks = useMemo(() => {
    const arr: number[] = []
    for (let i = 0; i <= 5000; i += 100) arr.push(i)
    return arr
  }, [])

  return (
    <div className="editor-ruler editor-ruler-v overflow-hidden text-[8px] text-forest-500">
      {ticks.map((px) => (
        <span
          key={px}
          className="absolute border-t border-forest-600"
          style={{ top: px, width: '100%', paddingLeft: 2 }}
        >
          {px}
        </span>
      ))}
    </div>
  )
}

export function GridOverlay() {
  const gridVisible = usePageEditor((s) => s.gridVisible)
  const gridColumns = usePageEditor((s) => s.gridColumns)
  const gridShowRulers = usePageEditor((s) => s.gridShowRulers)

  if (!gridVisible) return null

  const cols = Array.from({ length: gridColumns }, (_, i) => i)

  return (
    <div className="editor-grid-overlay" aria-hidden="true">
      {gridShowRulers && (
        <>
          <RulerH />
          <RulerV />
        </>
      )}
      <div
        className="absolute inset-0 mx-auto flex h-full"
        style={{ maxWidth: GRID_MAX_WIDTH, paddingLeft: gridShowRulers ? RULER_SIZE : 0, paddingTop: gridShowRulers ? RULER_SIZE : 0 }}
      >
        {cols.map((i) => (
          <div key={i} className="editor-grid-col h-full flex-1" />
        ))}
      </div>
    </div>
  )
}
