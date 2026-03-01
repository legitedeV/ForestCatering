'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { usePageEditor } from '@/lib/page-editor-store'

// Szerokości iframe wg breakpointu
const BREAKPOINT_WIDTHS: Record<string, number> = {
  desktop: 1440,
  tablet: 768,
  mobile: 375,
}

export function LivePreviewFrame() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const pageId = usePageEditor((s) => s.pageId)
  const sections = usePageEditor((s) => s.sections)
  const selectedBlockIndex = usePageEditor((s) => s.selectedBlockIndex)
  const previewBreakpoint = usePageEditor((s) => s.previewBreakpoint)
  const selectBlock = usePageEditor((s) => s.selectBlock)
  const setSidebarTab = usePageEditor((s) => s.setSidebarTab)

  const [isLoaded, setIsLoaded] = useState(false)
  const [scale, setScale] = useState(1)
  const [iframeSrc, setIframeSrc] = useState('')

  const iframeWidth = BREAKPOINT_WIDTHS[previewBreakpoint] ?? 1440

  // Ustaw src iframe po mount (potrzebujemy process.env po stronie klienta)
  useEffect(() => {
    if (pageId) {
      const secret = process.env.NEXT_PUBLIC_EDITOR_SECRET ?? ''
      setIframeSrc(`/page-editor/preview/${pageId}?secret=${secret}`)
    }
  }, [pageId])

  // Oblicz skalę, jeśli iframe jest szerszy niż kontener
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const recalcScale = () => {
      const containerWidth = container.clientWidth
      if (iframeWidth > containerWidth) {
        setScale(containerWidth / iframeWidth)
      } else {
        setScale(1)
      }
    }

    recalcScale()

    const observer = new ResizeObserver(recalcScale)
    observer.observe(container)
    return () => observer.disconnect()
  }, [iframeWidth])

  // Wyślij sekcje do iframe po zmianie
  useEffect(() => {
    if (!isLoaded) return
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'editor:sections-updated', sections },
      '*',
    )
  }, [sections, isLoaded])

  // Wyślij wybrany blok do iframe
  useEffect(() => {
    if (!isLoaded) return
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'editor:select-block', index: selectedBlockIndex },
      '*',
    )
  }, [selectedBlockIndex, isLoaded])

  // Odbieraj zdarzenia z iframe (kliknięcie bloku)
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'preview:block-clicked') {
        const index = event.data.index as number
        selectBlock(index)
        setSidebarTab('settings')
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [selectBlock, setSidebarTab])

  // Odśwież iframe
  const handleRefresh = useCallback(() => {
    setIsLoaded(false)
    if (iframeRef.current && iframeSrc) {
      iframeRef.current.src = iframeSrc
    }
  }, [iframeSrc])

  if (!pageId) return null

  return (
    <div className="relative flex h-full flex-col">
      {/* Przycisk odśwież */}
      <div className="absolute right-3 top-3 z-10">
        <button
          onClick={handleRefresh}
          className="rounded-md bg-forest-800 px-3 py-1.5 text-sm text-cream/80 transition-colors hover:bg-forest-700 hover:text-cream"
          title="Odśwież podgląd"
        >
          🔄 Odśwież
        </button>
      </div>

      {/* Kontener iframe z skalowaniem */}
      <div ref={containerRef} className="flex-1 overflow-auto p-4">
        {/* Skeleton ładowania */}
        {!isLoaded && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <p className="text-sm text-cream/60">Ładowanie podglądu…</p>
            </div>
          </div>
        )}

        {iframeSrc && (
          <div
            style={{
              width: iframeWidth,
              transform: scale < 1 ? `scale(${scale})` : undefined,
              transformOrigin: 'top left',
              height: scale < 1 ? `${100 / scale}%` : '100%',
            }}
            className={isLoaded ? '' : 'invisible'}
          >
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              onLoad={() => setIsLoaded(true)}
              className="h-full w-full border border-forest-700 rounded-lg"
              title="Podgląd strony"
            />
          </div>
        )}
      </div>
    </div>
  )
}
