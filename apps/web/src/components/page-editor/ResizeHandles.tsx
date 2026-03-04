'use client'

import React, { useCallback, useRef, useState } from 'react'

interface ResizeHandlesProps {
  width: number
  minHeight: number
  onResize: (w: number, h: number) => void
  zoom: number
}

interface Handle {
  id: string
  cursor: string
  className: string
  style: React.CSSProperties
  getNewSize: (dx: number, dy: number, w: number, h: number) => { w: number; h: number }
}

const MIN_WIDTH = 100
const MIN_HEIGHT = 50

export function ResizeHandles({ width, minHeight, onResize, zoom }: ResizeHandlesProps) {
  const [resizing, setResizing] = useState(false)
  const [liveSize, setLiveSize] = useState<{ w: number; h: number } | null>(null)
  const handleRef = useRef<Handle | null>(null)
  const startRef = useRef({ x: 0, y: 0, w: 0, h: 0 })

  const handles: Handle[] = [
    // Corners
    {
      id: 'nw',
      cursor: 'nwse-resize',
      className: 'resize-handle resize-handle-corner',
      style: { top: -4, left: -4 },
      getNewSize: (dx, dy, w, h) => ({ w: w - dx, h: h - dy }),
    },
    {
      id: 'ne',
      cursor: 'nesw-resize',
      className: 'resize-handle resize-handle-corner',
      style: { top: -4, right: -4 },
      getNewSize: (dx, _dy, w, h) => ({ w: w + dx, h: h - _dy }),
    },
    {
      id: 'sw',
      cursor: 'nesw-resize',
      className: 'resize-handle resize-handle-corner',
      style: { bottom: -4, left: -4 },
      getNewSize: (dx, dy, w, h) => ({ w: w - dx, h: h + dy }),
    },
    {
      id: 'se',
      cursor: 'nwse-resize',
      className: 'resize-handle resize-handle-corner',
      style: { bottom: -4, right: -4 },
      getNewSize: (dx, dy, w, h) => ({ w: w + dx, h: h + dy }),
    },
    // Edges
    {
      id: 'n',
      cursor: 'ns-resize',
      className: 'resize-handle resize-handle-edge-h',
      style: { top: -3, left: '50%', transform: 'translateX(-50%)' },
      getNewSize: (_dx, dy, w, h) => ({ w, h: h - dy }),
    },
    {
      id: 's',
      cursor: 'ns-resize',
      className: 'resize-handle resize-handle-edge-h',
      style: { bottom: -3, left: '50%', transform: 'translateX(-50%)' },
      getNewSize: (_dx, dy, w, h) => ({ w, h: h + dy }),
    },
    {
      id: 'w',
      cursor: 'ew-resize',
      className: 'resize-handle resize-handle-edge-v',
      style: { left: -3, top: '50%', transform: 'translateY(-50%)' },
      getNewSize: (dx, _dy, w, h) => ({ w: w - dx, h }),
    },
    {
      id: 'e',
      cursor: 'ew-resize',
      className: 'resize-handle resize-handle-edge-v',
      style: { right: -3, top: '50%', transform: 'translateY(-50%)' },
      getNewSize: (dx, _dy, w, h) => ({ w: w + dx, h }),
    },
  ]

  // Use a ref-based approach to commit resize
  const liveSizeRef = useRef(liveSize)
  liveSizeRef.current = liveSize

  const onPointerDownWrapped = useCallback((e: React.PointerEvent, handle: Handle) => {
    e.preventDefault()
    e.stopPropagation()
    handleRef.current = handle
    startRef.current = { x: e.clientX, y: e.clientY, w: width, h: minHeight }
    setResizing(true)
    setLiveSize(null)

    const onPointerMove = (ev: PointerEvent) => {
      const h = handleRef.current
      if (!h) return
      const dx = Math.round((ev.clientX - startRef.current.x) / zoom)
      const dy = Math.round((ev.clientY - startRef.current.y) / zoom)
      const newSize = h.getNewSize(dx, dy, startRef.current.w, startRef.current.h)
      newSize.w = Math.max(MIN_WIDTH, newSize.w)
      newSize.h = Math.max(MIN_HEIGHT, newSize.h)
      liveSizeRef.current = newSize
      setLiveSize({ ...newSize })
    }

    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerUp)
      const finalSize = liveSizeRef.current
      if (finalSize) {
        onResize(finalSize.w, finalSize.h)
      }
      setResizing(false)
      setLiveSize(null)
      handleRef.current = null
    }

    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)
  }, [width, minHeight, zoom, onResize])

  return (
    <div className="pointer-events-none absolute inset-0">
      {handles.map((h) => (
        <div
          key={h.id}
          className={h.className}
          style={{ ...h.style, cursor: h.cursor }}
          onPointerDown={(e) => onPointerDownWrapped(e, h)}
        />
      ))}
      {resizing && liveSize && (
        <div
          className="absolute rounded bg-forest-800 px-1.5 py-0.5 text-[10px] font-mono text-forest-300"
          style={{ bottom: -20, right: 0 }}
        >
          {liveSize.w} × {liveSize.h}
        </div>
      )}
    </div>
  )
}
