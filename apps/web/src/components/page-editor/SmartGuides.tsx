'use client'

import type { PageSection } from '@/components/cms/types'
import type { BlockStyleOverrides } from '@/lib/page-editor-store'

const SNAP_THRESHOLD = 5

interface SmartGuidesProps {
  sections: PageSection[]
  activeDragIndex: number | null
  activeDragRect: { x: number; y: number; width: number; height: number } | null
}

interface GuideLine {
  type: 'v' | 'h'
  position: number
}

function getBlockRect(block: PageSection) {
  const so = ((block as Record<string, unknown>).styleOverrides ?? {}) as BlockStyleOverrides
  const x = so.offsetX ?? 0
  const y = so.offsetY ?? 0
  const w = parseInt(so.width ?? '800', 10) || 800
  const h = parseInt(so.minHeight ?? '120', 10) || 120
  return { x, y, w, h }
}

export function SmartGuides({ sections, activeDragIndex, activeDragRect }: SmartGuidesProps) {
  if (activeDragIndex === null || !activeDragRect) return null

  const guides: GuideLine[] = []
  const active = activeDragRect
  const activeEdges = {
    left: active.x,
    right: active.x + active.width,
    centerX: active.x + active.width / 2,
    top: active.y,
    bottom: active.y + active.height,
    centerY: active.y + active.height / 2,
  }

  for (let i = 0; i < sections.length; i++) {
    if (i === activeDragIndex) continue
    const rect = getBlockRect(sections[i])
    const edges = {
      left: rect.x,
      right: rect.x + rect.w,
      centerX: rect.x + rect.w / 2,
      top: rect.y,
      bottom: rect.y + rect.h,
      centerY: rect.y + rect.h / 2,
    }

    // Vertical guides (x-axis alignment)
    const vPairs: [number, number][] = [
      [activeEdges.left, edges.left],
      [activeEdges.left, edges.right],
      [activeEdges.right, edges.left],
      [activeEdges.right, edges.right],
      [activeEdges.centerX, edges.centerX],
    ]
    for (const [a, b] of vPairs) {
      if (Math.abs(a - b) < SNAP_THRESHOLD) {
        guides.push({ type: 'v', position: b })
      }
    }

    // Horizontal guides (y-axis alignment)
    const hPairs: [number, number][] = [
      [activeEdges.top, edges.top],
      [activeEdges.top, edges.bottom],
      [activeEdges.bottom, edges.top],
      [activeEdges.bottom, edges.bottom],
      [activeEdges.centerY, edges.centerY],
    ]
    for (const [a, b] of hPairs) {
      if (Math.abs(a - b) < SNAP_THRESHOLD) {
        guides.push({ type: 'h', position: b })
      }
    }
  }

  // Deduplicate guides
  const seen = new Set<string>()
  const uniqueGuides = guides.filter((g) => {
    const key = `${g.type}-${g.position}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  if (uniqueGuides.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: 45 }} aria-hidden="true">
      {uniqueGuides.map((g, i) => (
        <div
          key={`${g.type}-${g.position}-${i}`}
          className={`smart-guide-line ${g.type === 'v' ? 'smart-guide-v' : 'smart-guide-h'}`}
          style={
            g.type === 'v'
              ? { left: g.position, top: 0, height: '100%' }
              : { top: g.position, left: 0, width: '100%' }
          }
        />
      ))}
    </div>
  )
}
