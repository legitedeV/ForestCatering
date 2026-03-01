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
  const pageTemplate = usePageEditor((s) => s.pageTemplate)
  const cssOverrides = usePageEditor((s) => s.cssOverrides)
  const customCss = usePageEditor((s) => s.customCss)
  const spacingInspectorEnabled = usePageEditor((s) => s.spacingInspectorEnabled)
  const blockComments = usePageEditor((s) => s.blockComments)
  const showComments = usePageEditor((s) => s.showComments)
  const inlineEditEnabled = usePageEditor((s) => s.inlineEditEnabled)

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

  // Wyślij sekcje do iframe po zmianie (debounce 150ms)
  useEffect(() => {
    if (!isLoaded) return
    const timer = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'editor:sections-updated', sections },
        '*',
      )
    }, 150)
    return () => clearTimeout(timer)
  }, [sections, isLoaded])

  // Wyślij wybrany blok do iframe
  useEffect(() => {
    if (!isLoaded) return
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'editor:select-block', index: selectedBlockIndex },
      '*',
    )
  }, [selectedBlockIndex, isLoaded])

  // Wyślij CSS overrides do iframe
  useEffect(() => {
    if (!isLoaded) return
    const timer = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: 'editor:css-overrides',
          overrides: cssOverrides,
          template: pageTemplate,
          customCss,
        },
        '*',
      )
    }, 150)
    return () => clearTimeout(timer)
  }, [cssOverrides, pageTemplate, customCss, isLoaded])

  // Wyślij spacing inspector state do iframe
  useEffect(() => {
    if (!isLoaded) return
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'editor:enable-spacing-inspector', enabled: spacingInspectorEnabled },
      '*',
    )
  }, [spacingInspectorEnabled, isLoaded])

  // Wyślij breakpoint do iframe (dla visibility)
  useEffect(() => {
    if (!isLoaded) return
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'editor:set-breakpoint', breakpoint: previewBreakpoint },
      '*',
    )
  }, [previewBreakpoint, isLoaded])

  // Wyślij komentarze do iframe
  useEffect(() => {
    if (!isLoaded) return
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'editor:comments-updated', comments: blockComments },
      '*',
    )
  }, [blockComments, isLoaded])

  // Wyślij stan komentarzy do iframe
  useEffect(() => {
    if (!isLoaded) return
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'editor:show-comments', enabled: showComments },
      '*',
    )
  }, [showComments, isLoaded])

  // Wyślij stan inline edit do iframe
  useEffect(() => {
    if (!isLoaded) return
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'editor:enable-inline-edit', enabled: inlineEditEnabled },
      '*',
    )
  }, [inlineEditEnabled, isLoaded])

  // Odbieraj zdarzenia z iframe (kliknięcie bloku + inline edit)
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'preview:block-clicked') {
        const index = event.data.index as number
        selectBlock(index)
        setSidebarTab('settings')
      }

      if (event.data?.type === 'preview:inline-edit') {
        const { blockIndex, fieldPath, value } = event.data as {
          blockIndex: number
          fieldPath: string
          value: unknown
        }
        usePageEditor.getState().updateBlockField(blockIndex, fieldPath, value)
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
