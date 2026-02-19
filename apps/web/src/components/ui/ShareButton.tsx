'use client'

import { useState } from 'react'

export function ShareButton() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard not available
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="rounded-lg border border-forest-700 bg-forest-800 px-4 py-2 text-sm text-forest-200 transition hover:border-accent/50 hover:text-cream"
    >
      {copied ? 'Link skopiowany! ✓' : 'Udostępnij'}
    </button>
  )
}
