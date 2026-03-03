'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { readForestConfigFromCss, DEFAULT_FOREST_AMBIENT } from '@/lib/forest-ambient-config'
import type { ForestAmbientConfig } from '@/lib/forest-ambient-config'

/* Lazy-load the heavy Three.js scene – no SSR */
const ForestScene = dynamic(() => import('@/components/ui/ForestScene'), { ssr: false })

/**
 * ForestAmbient — layered ambient effects
 * Layer 1: Three.js WebGL canvas (fireflies, leaves, light rays)
 * Layer 2: CSS-only fog drift animation
 * Layer 3: CSS-only floating orbs
 *
 * Reads configuration from CSS custom properties (--forest-*).
 * Updates reactively via `forest-ambient-config-changed` event.
 */
export default function ForestAmbient() {
  const [config, setConfig] = useState<ForestAmbientConfig>(DEFAULT_FOREST_AMBIENT)

  useEffect(() => {
    const readConfig = () => setConfig(readForestConfigFromCss())
    // Read initial config after mount (CSS vars may already be set)
    readConfig()
    // Listen for config changes from the editor
    window.addEventListener('forest-ambient-config-changed', readConfig)
    return () => window.removeEventListener('forest-ambient-config-changed', readConfig)
  }, [])

  if (!config.enabled) return null

  return (
    <div
      className="forest-ambient"
      aria-hidden="true"
      style={{ opacity: config.sceneOpacity }}
    >
      {/* WebGL layer */}
      <ForestScene config={config} />

      {/* CSS fog layers */}
      {config.fogEnabled && (
        <>
          <div className="forest-fog forest-fog--1" style={{ opacity: config.fogOpacity }} />
          <div className="forest-fog forest-fog--2" style={{ opacity: config.fogOpacity * 0.6 }} />
        </>
      )}

      {/* Floating CSS orbs */}
      {config.orbsEnabled && (
        <>
          <div className="forest-orb forest-orb--1" />
          <div className="forest-orb forest-orb--2" />
          <div className="forest-orb forest-orb--3" />
        </>
      )}

      {/* Subtle vignette */}
      {config.vignetteEnabled && (
        <div className="forest-vignette" style={{ opacity: config.vignetteOpacity }} />
      )}
    </div>
  )
}
