'use client'

import { useState, useEffect } from 'react'

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed right-6 bottom-6 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-forest-700 bg-forest-800 text-cream shadow-lg transition hover:border-accent-warm hover:bg-forest-700"
      aria-label="Do góry"
    >
      ↑
    </button>
  )
}
