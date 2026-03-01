// ────────────────────────────────────────────────────────
// Style presets, shadow presets, gradient presets, typography presets
// ────────────────────────────────────────────────────────

import type { BlockStyleOverrides } from './page-editor-store'

// ── Typography presets ──────────────────────────────────

export const TYPO_PRESETS = [
  { key: 'h1', label: 'H1', fontSize: 72, fontWeight: 700 as const, lineHeight: 1.1, letterSpacing: -0.02 },
  { key: 'h2', label: 'H2', fontSize: 48, fontWeight: 700 as const, lineHeight: 1.2, letterSpacing: -0.01 },
  { key: 'h3', label: 'H3', fontSize: 32, fontWeight: 600 as const, lineHeight: 1.3, letterSpacing: 0 },
  { key: 'h4', label: 'H4', fontSize: 24, fontWeight: 600 as const, lineHeight: 1.4, letterSpacing: 0 },
  { key: 'body', label: 'Body', fontSize: 16, fontWeight: 400 as const, lineHeight: 1.6, letterSpacing: 0 },
  { key: 'body-lg', label: 'Body L', fontSize: 18, fontWeight: 400 as const, lineHeight: 1.7, letterSpacing: 0 },
  { key: 'small', label: 'Small', fontSize: 14, fontWeight: 400 as const, lineHeight: 1.5, letterSpacing: 0.01 },
  { key: 'caption', label: 'Caption', fontSize: 12, fontWeight: 500 as const, lineHeight: 1.4, letterSpacing: 0.05, textTransform: 'uppercase' as const },
]

// ── Shadow presets ──────────────────────────────────────

export const SHADOW_PRESETS = [
  { key: 'none', label: 'Brak', value: 'none' },
  { key: 'sm', label: 'S', value: '0 1px 2px rgba(0,0,0,0.2)' },
  { key: 'md', label: 'M', value: '0 4px 12px rgba(0,0,0,0.25)' },
  { key: 'lg', label: 'L', value: '0 10px 30px rgba(0,0,0,0.3)' },
  { key: 'xl', label: 'XL', value: '0 20px 50px rgba(0,0,0,0.35)' },
  { key: '2xl', label: '2XL', value: '0 30px 80px rgba(0,0,0,0.4)' },
  { key: 'warm-glow', label: 'Warm Glow', value: '0 0 30px rgba(212,168,83,0.12), 0 0 60px rgba(212,168,83,0.06)' },
  { key: 'inner', label: 'Inner', value: 'inset 0 2px 6px rgba(0,0,0,0.3)' },
  { key: 'glass', label: 'Glass', value: '0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(212,168,83,0.1)' },
]

// ── Gradient presets ────────────────────────────────────

export const GRADIENT_PRESETS = [
  { key: 'forest-dusk', label: 'Forest Dusk', value: 'linear-gradient(135deg, #12161B 0%, #1F242B 50%, #333A43 100%)' },
  { key: 'golden-hour', label: 'Golden Hour', value: 'linear-gradient(135deg, #1F242B 0%, rgba(212,168,83,0.15) 50%, #1F242B 100%)' },
  { key: 'deep-night', label: 'Deep Night', value: 'linear-gradient(180deg, #12161B 0%, #1F242B 100%)' },
  { key: 'warm-fade', label: 'Warm Fade', value: 'linear-gradient(90deg, #1F242B 0%, rgba(212,168,83,0.08) 50%, #1F242B 100%)' },
  { key: 'forest-green', label: 'Forest Green', value: 'linear-gradient(135deg, #1F242B 0%, rgba(74,124,89,0.12) 50%, #1F242B 100%)' },
  { key: 'hero-warm', label: 'Hero Warm', value: 'linear-gradient(to bottom right, #12161B, #1F242B, #333A43)' },
]

// ── Repo color swatches ─────────────────────────────────

export const REPO_SWATCHES = [
  '#D4A853',
  '#E8C97A',
  '#B08A3A',
  '#4A7C59',
  '#5E9A6F',
  '#1F242B',
  '#12161B',
  '#333A43',
  '#F3F5F7',
  '#E6E9ED',
  '#7E8896',
  'transparent',
]

// ── Built-in style presets ──────────────────────────────

export const BUILT_IN_STYLE_PRESETS: Array<{ key: string; label: string; overrides: Partial<BlockStyleOverrides> }> = [
  { key: 'clean', label: '🧼 Czysty', overrides: { backgroundColor: 'transparent', borderWidth: 0, boxShadowPreset: 'none', borderRadius: 0 } },
  { key: 'card-glass', label: '🪟 Glass Card', overrides: { backgroundColor: 'rgba(31,36,43,0.6)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', boxShadowPreset: 'glass', backgroundBlur: 20 } },
  { key: 'card-warm', label: '✨ Warm Card', overrides: { backgroundColor: 'rgba(31,36,43,0.6)', borderRadius: 24, boxShadowPreset: 'warm-glow', borderWidth: 1, borderColor: 'rgba(212,168,83,0.2)' } },
  { key: 'hero-dark', label: '🌑 Hero Dark', overrides: { backgroundType: 'gradient', backgroundGradient: 'linear-gradient(135deg, #12161B, #1F242B, #333A43)', minHeight: '80vh', paddingTop: 160, paddingBottom: 160 } },
  { key: 'section-subtle', label: '🌫️ Subtle Section', overrides: { backgroundColor: '#1F242B', paddingTop: 80, paddingBottom: 80, borderWidth: 0 } },
  { key: 'floating', label: '☁️ Floating', overrides: { marginTop: -48, marginBottom: -48, borderRadius: 16, backgroundBlur: 16, backgroundColor: 'rgba(31,36,43,0.85)', borderWidth: 1, borderColor: 'rgba(126,136,150,0.15)', boxShadowPreset: 'lg' } },
]

// ── Saved presets (localStorage) ────────────────────────

export interface SavedStylePreset {
  key: string
  label: string
  createdAt: string
  overrides: Partial<BlockStyleOverrides>
}

const STORAGE_KEY = 'forest-editor-style-presets'

export function loadSavedPresets(): SavedStylePreset[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedStylePreset[]) : []
  } catch {
    return []
  }
}

export function saveSavedPresets(presets: SavedStylePreset[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
}

// ── Shadow resolver ─────────────────────────────────────

export function resolveBoxShadow(overrides: Partial<BlockStyleOverrides>): string | undefined {
  if (overrides.boxShadow) return overrides.boxShadow
  if (overrides.boxShadowPreset) {
    const preset = SHADOW_PRESETS.find((p) => p.key === overrides.boxShadowPreset)
    return preset?.value
  }
  return undefined
}
