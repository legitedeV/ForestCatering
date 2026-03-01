'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { usePageEditor } from '@/lib/page-editor-store'

// Szerokości iframe wg breakpointu
const BREAKPOINT_WIDTHS: Record<string, number> = {
  desktop: 1440,
  tablet: 768,
  mobile: 375,
}

function SinglePreviewFrame({
  iframeSrc,
  iframeWidth,
  containerWidth,
  dataBreakpoint,
  onLoad,
  iframeRef,
}: {
  iframeSrc: string
  iframeWidth: number
  containerWidth: number
  dataBreakpoint: string
  onLoad: () => void
  iframeRef?: React.RefObject<HTMLIFrameElement | null>
}) {
  const scale = iframeWidth > containerWidth ? containerWidth / iframeWidth : 1

  return (
    <div
      style={{
        width: iframeWidth,
        transform: scale < 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top left',
        height: scale < 1 ? `${100 / scale}%` : '100%',
      }}
    >
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        onLoad={onLoad}
        className="h-full w-full border border-forest-700 rounded-lg"
        title="Podgląd strony"
        data-breakpoint={dataBreakpoint}
      />
    </div>
  )
}

export function LivePreviewFrame() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const splitIframeRefs = useRef<Map<string, HTMLIFrameElement>>(new Map())

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
  const splitPreviewEnabled = usePageEditor((s) => s.splitPreviewEnabled)
  const splitPreviewBreakpoints = usePageEditor((s) => s.splitPreviewBreakpoints)
  const setA11yIssues = usePageEditor((s) => s.setA11yIssues)
  const globalCssOverlay = usePageEditor((s) => s.globalCssOverlay)
  const layoutCssOverlay = usePageEditor((s) => s.layoutCssOverlay)

  const [isLoaded, setIsLoaded] = useState(false)
  const [scale, setScale] = useState(1)
  const [iframeSrc, setIframeSrc] = useState('')
  const [splitLoaded, setSplitLoaded] = useState<Set<string>>(new Set())
  const lastScrollSourceRef = useRef<string | null>(null)

  const iframeWidth = BREAKPOINT_WIDTHS[previewBreakpoint] ?? 1440

  // Ustaw src iframe po mount
  useEffect(() => {
    if (pageId) {
      const secret = process.env.NEXT_PUBLIC_EDITOR_SECRET ?? ''
      setIframeSrc(`/page-editor/preview/${pageId}?secret=${secret}`)
    }
  }, [pageId])

  // Oblicz skalę, jeśli iframe jest szerszy niż kontener (single mode only)
  useEffect(() => {
    if (splitPreviewEnabled) return
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
  }, [iframeWidth, splitPreviewEnabled])

  // Helper to send message to all active iframes
  const postToAllIframes = useCallback((message: unknown) => {
    if (splitPreviewEnabled) {
      splitIframeRefs.current.forEach((iframe) => {
        iframe.contentWindow?.postMessage(message, '*')
      })
    } else {
      iframeRef.current?.contentWindow?.postMessage(message, '*')
    }
  }, [splitPreviewEnabled])

  const isAnyLoaded = splitPreviewEnabled ? splitLoaded.size > 0 : isLoaded

  // Wyślij sekcje do iframe po zmianie (debounce 150ms)
  useEffect(() => {
    if (!isAnyLoaded) return
    const timer = setTimeout(() => {
      postToAllIframes({ type: 'editor:sections-updated', sections })
    }, 150)
    return () => clearTimeout(timer)
  }, [sections, isAnyLoaded, postToAllIframes])

  // Wyślij wybrany blok do iframe
  useEffect(() => {
    if (!isAnyLoaded) return
    postToAllIframes({ type: 'editor:select-block', index: selectedBlockIndex })
  }, [selectedBlockIndex, isAnyLoaded, postToAllIframes])

  // Wyślij CSS overrides do iframe
  useEffect(() => {
    if (!isAnyLoaded) return
    const timer = setTimeout(() => {
      postToAllIframes({
        type: 'editor:css-overrides',
        overrides: cssOverrides,
        template: pageTemplate,
        customCss,
      })
    }, 150)
    return () => clearTimeout(timer)
  }, [cssOverrides, pageTemplate, customCss, isAnyLoaded, postToAllIframes])

  // Wyślij spacing inspector state do iframe
  useEffect(() => {
    if (!isAnyLoaded) return
    postToAllIframes({ type: 'editor:enable-spacing-inspector', enabled: spacingInspectorEnabled })
  }, [spacingInspectorEnabled, isAnyLoaded, postToAllIframes])

  // Wyślij breakpoint do iframe (for visibility)
  useEffect(() => {
    if (!isAnyLoaded) return
    postToAllIframes({ type: 'editor:set-breakpoint', breakpoint: previewBreakpoint })
  }, [previewBreakpoint, isAnyLoaded, postToAllIframes])

  // Wyślij komentarze do iframe
  useEffect(() => {
    if (!isAnyLoaded) return
    postToAllIframes({ type: 'editor:comments-updated', comments: blockComments })
  }, [blockComments, isAnyLoaded, postToAllIframes])

  // Wyślij stan komentarzy do iframe
  useEffect(() => {
    if (!isAnyLoaded) return
    postToAllIframes({ type: 'editor:show-comments', enabled: showComments })
  }, [showComments, isAnyLoaded, postToAllIframes])

  // Wyślij stan inline edit do iframe
  useEffect(() => {
    if (!isAnyLoaded) return
    postToAllIframes({ type: 'editor:enable-inline-edit', enabled: inlineEditEnabled })
  }, [inlineEditEnabled, isAnyLoaded, postToAllIframes])

  // Wyślij CSS overlays do iframe
  useEffect(() => {
    if (!isAnyLoaded) return
    const timer = setTimeout(() => {
      postToAllIframes({
        type: 'editor:css-overlays-updated',
        globalCssOverlay,
        layoutCssOverlay,
      })
    }, 200)
    return () => clearTimeout(timer)
  }, [globalCssOverlay, layoutCssOverlay, isAnyLoaded, postToAllIframes])

  // Odbieraj zdarzenia z iframe (kliknięcie bloku + inline edit + scroll sync + a11y)
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

      // Scroll sync: receive scroll from one iframe, forward to others
      if (event.data?.type === 'preview:scroll' && splitPreviewEnabled) {
        const { scrollPercent, sourceBreakpoint } = event.data as {
          scrollPercent: number
          sourceBreakpoint: string
        }
        lastScrollSourceRef.current = sourceBreakpoint
        splitIframeRefs.current.forEach((iframe, bp) => {
          if (bp !== sourceBreakpoint) {
            iframe.contentWindow?.postMessage(
              { type: 'editor:sync-scroll', scrollPercent },
              '*',
            )
          }
        })
      }

      // A11y audit results
      if (event.data?.type === 'preview:a11y-results') {
        setA11yIssues(event.data.issues ?? [])
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [selectBlock, setSidebarTab, splitPreviewEnabled, setA11yIssues])

  // Odśwież iframe
  const handleRefresh = useCallback(() => {
    setIsLoaded(false)
    setSplitLoaded(new Set())
    if (splitPreviewEnabled) {
      splitIframeRefs.current.forEach((iframe) => {
        if (iframeSrc) iframe.src = iframeSrc
      })
    } else if (iframeRef.current && iframeSrc) {
      iframeRef.current.src = iframeSrc
    }
  }, [iframeSrc, splitPreviewEnabled])

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
        {!isAnyLoaded && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <p className="text-sm text-cream/60">Ładowanie podglądu…</p>
            </div>
          </div>
        )}

        {/* Split mode: multiple iframes */}
        {splitPreviewEnabled && iframeSrc && (
          <div className={`flex gap-2 ${isAnyLoaded ? '' : 'invisible'}`}>
            {splitPreviewBreakpoints.map((bp) => {
              const w = BREAKPOINT_WIDTHS[bp] ?? 1440
              const containerW = (containerRef.current?.clientWidth ?? 1440) / splitPreviewBreakpoints.length - 8
              const s = w > containerW ? containerW / w : 1
              return (
                <div key={bp} className="flex-1 overflow-hidden">
                  <p className="mb-1 text-center text-[10px] font-medium uppercase text-forest-500">{bp} ({w}px)</p>
                  <div
                    style={{
                      width: w,
                      transform: s < 1 ? `scale(${s})` : undefined,
                      transformOrigin: 'top left',
                      height: s < 1 ? `${100 / s}%` : '100%',
                    }}
                  >
                    <iframe
                      ref={(el) => {
                        if (el) splitIframeRefs.current.set(bp, el)
                        else splitIframeRefs.current.delete(bp)
                      }}
                      src={`${iframeSrc}&bp=${bp}`}
                      onLoad={() => setSplitLoaded((prev) => new Set([...prev, bp]))}
                      className="h-full w-full border border-forest-700 rounded-lg"
                      title={`Podgląd strony — ${bp}`}
                      data-breakpoint={bp}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Single mode: one iframe */}
        {!splitPreviewEnabled && iframeSrc && (
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
