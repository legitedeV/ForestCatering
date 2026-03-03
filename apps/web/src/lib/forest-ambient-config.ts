/**
 * Forest Ambient Configuration
 * Configurable settings for the Three.js + CSS ambient forest scene.
 * Editable from the page editor's Style panel.
 */

export interface ForestAmbientConfig {
  enabled: boolean
  fireflyCount: number
  fireflyColor: string
  leafCount: number
  fogDensity: number
  fogEnabled: boolean
  fogOpacity: number
  orbsEnabled: boolean
  vignetteEnabled: boolean
  vignetteOpacity: number
  lightRaysEnabled: boolean
  lightRaysColor: string
  sceneOpacity: number
}

export const DEFAULT_FOREST_AMBIENT: ForestAmbientConfig = {
  enabled: true,
  fireflyCount: 80,
  fireflyColor: '#d4a853',
  leafCount: 30,
  fogDensity: 0.06,
  fogEnabled: true,
  fogOpacity: 0.25,
  orbsEnabled: true,
  vignetteEnabled: true,
  vignetteOpacity: 0.5,
  lightRaysEnabled: true,
  lightRaysColor: '#d4a853',
  sceneOpacity: 1,
}

/** CSS custom property names mapped to config keys */
const CSS_VAR_MAP: Record<keyof ForestAmbientConfig, string> = {
  enabled: '--forest-ambient-enabled',
  fireflyCount: '--forest-firefly-count',
  fireflyColor: '--forest-firefly-color',
  leafCount: '--forest-leaf-count',
  fogDensity: '--forest-fog-density',
  fogEnabled: '--forest-fog-enabled',
  fogOpacity: '--forest-fog-opacity',
  orbsEnabled: '--forest-orbs-enabled',
  vignetteEnabled: '--forest-vignette-enabled',
  vignetteOpacity: '--forest-vignette-opacity',
  lightRaysEnabled: '--forest-rays-enabled',
  lightRaysColor: '--forest-rays-color',
  sceneOpacity: '--forest-scene-opacity',
}

/** Convert boolean to CSS-friendly 0/1 */
function toCssVal(value: unknown): string {
  if (typeof value === 'boolean') return value ? '1' : '0'
  return String(value)
}

/** Generate CSS custom property declarations from config */
export function forestConfigToCss(config: Partial<ForestAmbientConfig>): string {
  const lines: string[] = []
  for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
    const val = config[key as keyof ForestAmbientConfig]
    if (val !== undefined) {
      lines.push(`  ${cssVar}: ${toCssVal(val)};`)
    }
  }
  if (lines.length === 0) return ''
  return `:root {\n${lines.join('\n')}\n}`
}

/** Read forest ambient config from CSS custom properties on :root */
export function readForestConfigFromCss(): ForestAmbientConfig {
  if (typeof window === 'undefined') return { ...DEFAULT_FOREST_AMBIENT }
  const style = getComputedStyle(document.documentElement)
  const get = (varName: string) => style.getPropertyValue(varName).trim()

  return {
    enabled: get('--forest-ambient-enabled') !== '0',
    fireflyCount: parseInt(get('--forest-firefly-count'), 10) || DEFAULT_FOREST_AMBIENT.fireflyCount,
    fireflyColor: get('--forest-firefly-color') || DEFAULT_FOREST_AMBIENT.fireflyColor,
    leafCount: parseInt(get('--forest-leaf-count'), 10) || DEFAULT_FOREST_AMBIENT.leafCount,
    fogDensity: parseFloat(get('--forest-fog-density')) || DEFAULT_FOREST_AMBIENT.fogDensity,
    fogEnabled: get('--forest-fog-enabled') !== '0',
    fogOpacity: parseFloat(get('--forest-fog-opacity')) || DEFAULT_FOREST_AMBIENT.fogOpacity,
    orbsEnabled: get('--forest-orbs-enabled') !== '0',
    vignetteEnabled: get('--forest-vignette-enabled') !== '0',
    vignetteOpacity: parseFloat(get('--forest-vignette-opacity')) || DEFAULT_FOREST_AMBIENT.vignetteOpacity,
    lightRaysEnabled: get('--forest-rays-enabled') !== '0',
    lightRaysColor: get('--forest-rays-color') || DEFAULT_FOREST_AMBIENT.lightRaysColor,
    sceneOpacity: parseFloat(get('--forest-scene-opacity')) || DEFAULT_FOREST_AMBIENT.sceneOpacity,
  }
}
