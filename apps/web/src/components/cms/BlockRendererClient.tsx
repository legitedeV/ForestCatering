'use client'
import { useBlockAnimations } from './useBlockAnimations'

interface Props {
  children: React.ReactNode
}

/**
 * Client-side wrapper that activates IntersectionObserver-based entrance animations.
 * BlockRenderer must be passed as children (server component pattern) — NOT imported
 * directly here, because BlockRenderer imports server-only modules.
 *
 * Usage in page.tsx:
 *   <BlockRendererClient>
 *     <BlockRenderer sections={page.sections} />
 *   </BlockRendererClient>
 */
export function BlockRendererClient({ children }: Props) {
  const ref = useBlockAnimations()
  return (
    <div ref={ref}>
      {children}
    </div>
  )
}
