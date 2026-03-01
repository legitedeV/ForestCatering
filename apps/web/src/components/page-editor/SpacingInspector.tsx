'use client'

import { useEffect, useState } from 'react'

interface SpacingData {
  index: number
  margin: { top: number; right: number; bottom: number; left: number }
  padding: { top: number; right: number; bottom: number; left: number }
  width: number
  height: number
  offsetTop: number
  offsetLeft: number
}

export function SpacingInspector({ enabled }: { enabled: boolean }) {
  const [spacing, setSpacing] = useState<SpacingData | null>(null)

  useEffect(() => {
    if (!enabled) {
      setSpacing(null)
      return
    }

    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'preview:block-spacing') {
        setSpacing(event.data as SpacingData)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [enabled])

  if (!enabled || !spacing) return null

  const { margin, padding, width, height, offsetTop, offsetLeft } = spacing

  return (
    <div
      className="pointer-events-none absolute z-50"
      style={{ top: offsetTop, left: offsetLeft, width, height }}
      aria-hidden="true"
    >
      {/* Margin overlay (green) */}
      {margin.top > 0 && (
        <div
          className="absolute flex items-center justify-center text-[9px] font-mono text-green-400"
          style={{ top: -margin.top, left: 0, right: 0, height: margin.top, background: 'rgba(34,197,94,0.12)' }}
        >
          {margin.top}
        </div>
      )}
      {margin.bottom > 0 && (
        <div
          className="absolute flex items-center justify-center text-[9px] font-mono text-green-400"
          style={{ bottom: -margin.bottom, left: 0, right: 0, height: margin.bottom, background: 'rgba(34,197,94,0.12)' }}
        >
          {margin.bottom}
        </div>
      )}
      {margin.left > 0 && (
        <div
          className="absolute flex items-center justify-center text-[9px] font-mono text-green-400"
          style={{ top: 0, left: -margin.left, width: margin.left, bottom: 0, background: 'rgba(34,197,94,0.12)' }}
        >
          {margin.left}
        </div>
      )}
      {margin.right > 0 && (
        <div
          className="absolute flex items-center justify-center text-[9px] font-mono text-green-400"
          style={{ top: 0, right: -margin.right, width: margin.right, bottom: 0, background: 'rgba(34,197,94,0.12)' }}
        >
          {margin.right}
        </div>
      )}

      {/* Padding overlay (purple) */}
      {padding.top > 0 && (
        <div
          className="absolute flex items-center justify-center text-[9px] font-mono text-purple-400"
          style={{ top: 0, left: 0, right: 0, height: padding.top, background: 'rgba(168,85,247,0.12)' }}
        >
          {padding.top}
        </div>
      )}
      {padding.bottom > 0 && (
        <div
          className="absolute flex items-center justify-center text-[9px] font-mono text-purple-400"
          style={{ bottom: 0, left: 0, right: 0, height: padding.bottom, background: 'rgba(168,85,247,0.12)' }}
        >
          {padding.bottom}
        </div>
      )}
      {padding.left > 0 && (
        <div
          className="absolute flex items-center justify-center text-[9px] font-mono text-purple-400"
          style={{ top: 0, left: 0, width: padding.left, bottom: 0, background: 'rgba(168,85,247,0.12)' }}
        >
          {padding.left}
        </div>
      )}
      {padding.right > 0 && (
        <div
          className="absolute flex items-center justify-center text-[9px] font-mono text-purple-400"
          style={{ top: 0, right: 0, width: padding.right, bottom: 0, background: 'rgba(168,85,247,0.12)' }}
        >
          {padding.right}
        </div>
      )}

      {/* Content box outline */}
      <div className="absolute inset-0 border border-dashed border-blue-400/30" />
    </div>
  )
}
