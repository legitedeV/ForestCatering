import type { BlockStyleOverrides } from './page-editor-store'
import { resolveBoxShadow } from './style-presets'

/**
 * Generates scoped CSS string from styleOverrides for a block identified by blockId.
 *
 * Uses selectors with HIGHER specificity than Tailwind utility classes
 * inside the block. Tailwind utility = 0-1-0. Our selector:
 * [data-block-id="xxx"] h1 { color: red !important; }
 *
 * !important is necessary because Tailwind utilities like text-cream generate:
 *   .text-cream { color: var(--color-cream); }
 * Even [data-block-id] h1 has the same specificity as .text-cream.
 * !important is the only reliable way to override Tailwind utility classes
 * from outside, without modifying components.
 *
 * IMPORTANT: !important is ONLY used in editor preview (iframe), NOT on production pages.
 */
export function generateBlockScopedCss(
  blockId: string,
  overrides: BlockStyleOverrides | undefined,
): string {
  if (!overrides) return ''

  const safeId = blockId.replace(/[^a-zA-Z0-9_-]/g, '')
  const scope = `[data-block-id="${safeId}"]`
  let css = ''

  // ═══════════════════════════════════════════
  // TYPOGRAPHY
  // ═══════════════════════════════════════════

  const textSelectors = `${scope} h1, ${scope} h2, ${scope} h3, ${scope} h4, ${scope} p, ${scope} span:not(.sr-only), ${scope} a, ${scope} li, ${scope} label`

  if (overrides.textColor) {
    css += `${textSelectors} { color: ${overrides.textColor} !important; }\n`
  }

  if (overrides.fontSize) {
    css += `${scope} h1, ${scope} h2 { font-size: ${overrides.fontSize}px !important; }\n`
  }

  if (overrides.fontWeight) {
    css += `${scope} h1, ${scope} h2, ${scope} h3 { font-weight: ${overrides.fontWeight} !important; }\n`
  }

  if (overrides.lineHeight) {
    css += `${scope} h1, ${scope} h2, ${scope} h3, ${scope} p { line-height: ${overrides.lineHeight} !important; }\n`
  }

  if (overrides.letterSpacing !== undefined) {
    css += `${scope} h1, ${scope} h2, ${scope} h3 { letter-spacing: ${overrides.letterSpacing}em !important; }\n`
  }

  if (overrides.textAlign) {
    css += `${scope} { text-align: ${overrides.textAlign} !important; }\n`
    css += `${scope} > * { text-align: ${overrides.textAlign} !important; }\n`
  }

  if (overrides.textTransform && overrides.textTransform !== 'none') {
    css += `${scope} h1, ${scope} h2, ${scope} h3 { text-transform: ${overrides.textTransform} !important; }\n`
  }

  // ═══════════════════════════════════════════
  // BACKGROUND
  // ═══════════════════════════════════════════

  if (overrides.backgroundType === 'solid' && overrides.backgroundColor) {
    css += `${scope}, ${scope} > section { background-color: ${overrides.backgroundColor} !important; background-image: none !important; }\n`
  } else if (overrides.backgroundColor && !overrides.backgroundType) {
    css += `${scope}, ${scope} > section { background-color: ${overrides.backgroundColor} !important; background-image: none !important; }\n`
  }

  if (overrides.backgroundType === 'gradient' && overrides.backgroundGradient) {
    css += `${scope}, ${scope} > section { background-image: ${overrides.backgroundGradient} !important; }\n`
  }

  if (overrides.backgroundType === 'image' && overrides.backgroundImage) {
    css += `${scope}, ${scope} > section { background-image: url(${overrides.backgroundImage}) !important; background-size: cover !important; background-position: center !important; }\n`
  }

  if (overrides.backgroundType === 'none') {
    css += `${scope}, ${scope} > section { background-color: transparent !important; background-image: none !important; }\n`
  }

  if (overrides.backgroundBlur) {
    css += `${scope} { backdrop-filter: blur(${overrides.backgroundBlur}px) !important; }\n`
  }

  // ═══════════════════════════════════════════
  // ACCENT COLOR
  // ═══════════════════════════════════════════

  if (overrides.accentColor) {
    css += `${scope} a[class*="bg-accent"], ${scope} button[class*="bg-accent"] { background-color: ${overrides.accentColor} !important; }\n`
    css += `${scope} a[class*="text-accent"] { color: ${overrides.accentColor} !important; }\n`
    css += `${scope} [class*="border-accent"] { border-color: ${overrides.accentColor} !important; }\n`
    css += `${scope} [class*="bg-accent"]:not(a):not(button) { background-color: ${overrides.accentColor} !important; }\n`
    css += `${scope} [class*="text-accent-warm"] { color: ${overrides.accentColor} !important; }\n`
    css += `${scope} [class*="bg-accent-warm"] { background-color: ${overrides.accentColor} !important; }\n`
    css += `${scope} [class*="border-accent-warm"] { border-color: ${overrides.accentColor} !important; }\n`
  }

  // ═══════════════════════════════════════════
  // BORDERS
  // ═══════════════════════════════════════════

  if (overrides.borderColor) {
    css += `${scope}, ${scope} > section { border-color: ${overrides.borderColor} !important; }\n`
  }

  if (overrides.borderRadius !== undefined) {
    css += `${scope}, ${scope} > section { border-radius: ${overrides.borderRadius}px !important; }\n`
  }

  if (overrides.borderWidth !== undefined) {
    css += `${scope}, ${scope} > section { border-width: ${overrides.borderWidth}px !important; border-style: ${overrides.borderStyle ?? 'solid'} !important; }\n`
  }

  if (overrides.borderRadiusTL !== undefined) {
    css += `${scope}, ${scope} > section { border-top-left-radius: ${overrides.borderRadiusTL}px !important; }\n`
  }
  if (overrides.borderRadiusTR !== undefined) {
    css += `${scope}, ${scope} > section { border-top-right-radius: ${overrides.borderRadiusTR}px !important; }\n`
  }
  if (overrides.borderRadiusBL !== undefined) {
    css += `${scope}, ${scope} > section { border-bottom-left-radius: ${overrides.borderRadiusBL}px !important; }\n`
  }
  if (overrides.borderRadiusBR !== undefined) {
    css += `${scope}, ${scope} > section { border-bottom-right-radius: ${overrides.borderRadiusBR}px !important; }\n`
  }

  // ═══════════════════════════════════════════
  // SPACING — on inner section elements
  // ═══════════════════════════════════════════

  if (overrides.paddingTop !== undefined) css += `${scope} > section { padding-top: ${overrides.paddingTop}px !important; }\n`
  if (overrides.paddingBottom !== undefined) css += `${scope} > section { padding-bottom: ${overrides.paddingBottom}px !important; }\n`
  if (overrides.paddingLeft !== undefined) css += `${scope} > section { padding-left: ${overrides.paddingLeft}px !important; }\n`
  if (overrides.paddingRight !== undefined) css += `${scope} > section { padding-right: ${overrides.paddingRight}px !important; }\n`

  if (overrides.marginTop !== undefined) css += `${scope} { margin-top: ${overrides.marginTop}px !important; }\n`
  if (overrides.marginBottom !== undefined) css += `${scope} { margin-bottom: ${overrides.marginBottom}px !important; }\n`
  if (overrides.marginLeft !== undefined) css += `${scope} { margin-left: ${overrides.marginLeft}px !important; }\n`
  if (overrides.marginRight !== undefined) css += `${scope} { margin-right: ${overrides.marginRight}px !important; }\n`

  // ═══════════════════════════════════════════
  // POSITION OFFSET (pixel-perfect)
  // ═══════════════════════════════════════════

  if (overrides.offsetX !== undefined || overrides.offsetY !== undefined) {
    const tx = overrides.offsetX !== undefined ? `${overrides.offsetX}px` : '0'
    const ty = overrides.offsetY !== undefined ? `${overrides.offsetY}px` : '0'
    css += `${scope} { transform: translate(${tx}, ${ty}) !important; }\n`
  }

  // ═══════════════════════════════════════════
  // OPACITY, OVERFLOW
  // ═══════════════════════════════════════════

  if (overrides.opacity !== undefined) {
    css += `${scope} { opacity: ${overrides.opacity} !important; }\n`
  }

  if (overrides.overflow) {
    css += `${scope} { overflow: ${overrides.overflow} !important; }\n`
  }

  // ═══════════════════════════════════════════
  // BOX SHADOW
  // ═══════════════════════════════════════════

  const shadow = resolveBoxShadow(overrides)
  if (shadow && shadow !== 'none') {
    css += `${scope}, ${scope} > section { box-shadow: ${shadow} !important; }\n`
  }

  return css
}

/**
 * Generates CSS for ALL blocks on the page.
 * Called in PreviewClient after each render.
 */
export function generateAllBlocksCss(
  sections: Array<{ id: string; styleOverrides?: BlockStyleOverrides; animation?: string }>,
): string {
  let allCss = ''
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    const blockId = section.id
    const overrides = section.styleOverrides
    if (overrides && Object.keys(overrides).length > 0) {
      allCss += generateBlockScopedCss(blockId, overrides)
    }
    // If block has animation from editor, disable built-in AnimatedSection animations
    if (section.animation) {
      const safeId = blockId.replace(/[^a-zA-Z0-9_-]/g, '')
      allCss += `[data-block-id="${safeId}"] .animated-section { opacity: 1 !important; transform: none !important; transition: none !important; }\n`
    }
  }
  return allCss
}
