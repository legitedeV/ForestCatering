'use client'

import { useState, useCallback, useRef } from 'react'
import { usePageEditor } from '@/lib/page-editor-store'
import type { BlockStyleOverrides } from '@/lib/page-editor-store'
import type { PageSection } from '@/components/cms/types'

interface SelectionRectProps {
  sections: PageSection[]
}

interface RectState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  active: boolean
}

function getBlockRect(block: PageSection) {
  const so = ((block as Record<string, unknown>).styleOverrides ?? {}) as BlockStyleOverrides
  return {
    x: so.offsetX ?? 0,
    y: so.offsetY ?? 0,
    w: parseInt(so.width ?? '800', 10) || 800,
    h: parseInt(so.minHeight ?? '120', 10) || 120,
  }
}

function rectsIntersect(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

export function SelectionRect({ sections }: SelectionRectProps) {
  const toggleBlockSelection = usePageEditor((s) => s.toggleBlockSelection)
  const clearBlockSelection = usePageEditor((s) => s.clearBlockSelection)
  const canvasZoom = usePageEditor((s) => s.canvasZoom)
  const [rect, setRect] = useState<RectState>({ startX: 0, startY: 0, currentX: 0, currentY: 0, active: false })
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only trigger on background clicks (not on blocks)
    if (e.target !== e.currentTarget) return
    if (e.button !== 0) return

    const container = containerRef.current
    if (!container) return
    const bounds = container.getBoundingClientRect()
    const x = (e.clientX - bounds.left) / canvasZoom
    const y = (e.clientY - bounds.top) / canvasZoom

    clearBlockSelection()
    setRect({ startX: x, startY: y, currentX: x, currentY: y, active: true })

    const onPointerMove = (ev: PointerEvent) => {
      const mx = (ev.clientX - bounds.left) / canvasZoom
      const my = (ev.clientY - bounds.top) / canvasZoom
      setRect((prev) => ({ ...prev, currentX: mx, currentY: my }))
    }

    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerUp)
      setRect((prev) => {
        if (!prev.active) return prev
        const selX = Math.min(prev.startX, prev.currentX)
        const selY = Math.min(prev.startY, prev.currentY)
        const selW = Math.abs(prev.currentX - prev.startX)
        const selH = Math.abs(prev.currentY - prev.startY)

        if (selW > 5 || selH > 5) {
          const selRect = { x: selX, y: selY, w: selW, h: selH }
          sections.forEach((block, i) => {
            const blockRect = getBlockRect(block)
            if (rectsIntersect(selRect, blockRect)) {
              toggleBlockSelection(i)
            }
          })
        }
        return { ...prev, active: false }
      })
    }

    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)
  }, [sections, toggleBlockSelection, clearBlockSelection, canvasZoom])

  const selX = Math.min(rect.startX, rect.currentX)
  const selY = Math.min(rect.startY, rect.currentY)
  const selW = Math.abs(rect.currentX - rect.startX)
  const selH = Math.abs(rect.currentY - rect.startY)

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ pointerEvents: 'auto', zIndex: 1 }}
      onPointerDown={handlePointerDown}
    >
      {rect.active && (selW > 2 || selH > 2) && (
        <div
          className="selection-rect"
          style={{
            left: selX,
            top: selY,
            width: selW,
            height: selH,
          }}
        />
      )}
    </div>
  )
}
