'use client'

export function PageCssOverlay({
  globalCssOverlay,
  layoutCssOverlay,
}: {
  globalCssOverlay?: string | null
  layoutCssOverlay?: string | null
}) {
  if (!globalCssOverlay && !layoutCssOverlay) return null
  const enabled = process.env.NEXT_PUBLIC_ENABLE_CSS_OVERLAYS === 'true'
  if (!enabled) return null
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `${globalCssOverlay || ''}\n${layoutCssOverlay || ''}`,
      }}
    />
  )
}
