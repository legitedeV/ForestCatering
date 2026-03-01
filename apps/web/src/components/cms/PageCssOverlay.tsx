'use client'

/** Sanitize CSS to prevent script injection */
function sanitizeCss(css: string): string {
  return css
    .replace(/<\/?script[^>]*>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/@import\s+url\s*\(\s*['"]?\s*javascript/gi, '')
}

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
        __html: sanitizeCss(`${globalCssOverlay || ''}\n${layoutCssOverlay || ''}`),
      }}
    />
  )
}
