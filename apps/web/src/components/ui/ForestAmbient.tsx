'use client'

import dynamic from 'next/dynamic'

/* Lazy-load the heavy Three.js scene – no SSR */
const ForestScene = dynamic(() => import('@/components/ui/ForestScene'), { ssr: false })

/**
 * ForestAmbient — layered ambient effects
 * Layer 1: Three.js WebGL canvas (fireflies, leaves, light rays)
 * Layer 2: CSS-only fog drift animation
 * Layer 3: CSS-only floating orbs
 */
export default function ForestAmbient() {
  return (
    <div className="forest-ambient" aria-hidden="true">
      {/* WebGL layer */}
      <ForestScene />

      {/* CSS fog layers */}
      <div className="forest-fog forest-fog--1" />
      <div className="forest-fog forest-fog--2" />

      {/* Floating CSS orbs */}
      <div className="forest-orb forest-orb--1" />
      <div className="forest-orb forest-orb--2" />
      <div className="forest-orb forest-orb--3" />

      {/* Subtle vignette */}
      <div className="forest-vignette" />
    </div>
  )
}
