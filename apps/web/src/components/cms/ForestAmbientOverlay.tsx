'use client'

import { forestConfigToCss } from '@/lib/forest-ambient-config'
import type { ForestAmbientConfig } from '@/lib/forest-ambient-config'

/**
 * Injects CSS custom properties for forest ambient configuration.
 * Used in production to pass per-page config to the ForestAmbient
 * component rendered in the layout.
 */
export function ForestAmbientOverlay({
  config,
}: {
  config?: Partial<ForestAmbientConfig> | null
}) {
  if (!config) return null
  const css = forestConfigToCss(config)
  if (!css) return null

  return (
    <style
      id="forest-ambient-config"
      dangerouslySetInnerHTML={{ __html: css }}
    />
  )
}
