'use client'
import { useEffect, useRef } from 'react'

/**
 * IntersectionObserver hook that adds the `visible` class to [data-block-id] elements
 * when they enter the viewport. This triggers CSS entrance animations (.anim-fade-up-soft,
 * .anim-scale-elastic, .anim-cascade, etc.) on production pages via BlockRendererClient.
 */
export function useBlockAnimations() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const elements = container.querySelectorAll('[data-block-id]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return containerRef
}
