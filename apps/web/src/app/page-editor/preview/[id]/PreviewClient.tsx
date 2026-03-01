'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { PageSection } from '@/components/cms/types'
import { ANIMATION_CATALOG } from '@/lib/animation-catalog'
import type { BlockStyleOverrides } from '@/lib/page-editor-store'
import { generateAllBlocksCss } from '@/lib/block-style-injector'
import type { BlockComment } from '@/lib/block-comments'

// Build a Map for O(1) animation lookups
const ANIMATION_MAP = new Map(ANIMATION_CATALOG.map((a) => [a.key, a]))

// Importy bloków bezpośrednio — pomijamy BlockRenderer, bo FeaturedProductsBlock
// jest server component (importuje getPayload) i nie działa w kontekście 'use client'
import { HeroBlock } from '@/components/cms/blocks/HeroBlock'
import { RichTextBlock } from '@/components/cms/blocks/RichTextBlock'
import { GalleryBlock } from '@/components/cms/blocks/GalleryBlock'
import { CTABlock } from '@/components/cms/blocks/CTABlock'
import { FAQBlock } from '@/components/cms/blocks/FAQBlock'
import { StatsBlock } from '@/components/cms/blocks/StatsBlock'
import { ServicesBlock } from '@/components/cms/blocks/ServicesBlock'
import { AboutBlock } from '@/components/cms/blocks/AboutBlock'
import { TestimonialsBlock } from '@/components/cms/blocks/TestimonialsBlock'
import { PricingBlock } from '@/components/cms/blocks/PricingBlock'
import { StepsBlock } from '@/components/cms/blocks/StepsBlock'
import { ContactFormBlock } from '@/components/cms/blocks/ContactFormBlock'
import { LegalTextBlock } from '@/components/cms/blocks/LegalTextBlock'
import { GalleryFullBlock } from '@/components/cms/blocks/GalleryFullBlock'
import { PartnersBlock } from '@/components/cms/blocks/PartnersBlock'
import { TeamBlock } from '@/components/cms/blocks/TeamBlock'
import { MapAreaBlock } from '@/components/cms/blocks/MapAreaBlock'
import { OfferCardsBlock } from '@/components/cms/blocks/OfferCardsBlock'

interface Props {
  initialSections: PageSection[]
}

/** Helper: px value or undefined */
function px(v: number | undefined): string | undefined {
  return v !== undefined ? `${v}px` : undefined
}

/** Helper: translate transform */
function translate(x?: number, y?: number): string | undefined {
  if (!x && !y) return undefined
  return `translate(${x ?? 0}px, ${y ?? 0}px)`
}

/** Determine if block should be hidden on given breakpoint */
function shouldHide(overrides: BlockStyleOverrides | undefined, breakpoint: string): boolean {
  if (!overrides) return false
  if (breakpoint === 'desktop' && overrides.hideOnDesktop) return true
  if (breakpoint === 'tablet' && overrides.hideOnTablet) return true
  if (breakpoint === 'mobile' && overrides.hideOnMobile) return true
  return false
}

/** Build full inline styles from block style overrides */
function buildInlineStyles(overrides: BlockStyleOverrides | undefined, breakpoint: string): React.CSSProperties {
  if (!overrides) return {}
  // Only layout/positioning properties on the wrapper div.
  // Typography, colors, backgrounds, borders, shadows, opacity, backdrop
  // are now handled by the CSS injector (block-style-injector.ts) with
  // scoped selectors and !important to override hardcoded Tailwind classes.
  return {
    // Spacing (wrapper)
    paddingTop: px(overrides.paddingTop),
    paddingRight: px(overrides.paddingRight),
    paddingBottom: px(overrides.paddingBottom),
    paddingLeft: px(overrides.paddingLeft),
    marginTop: px(overrides.marginTop),
    marginRight: px(overrides.marginRight),
    marginBottom: px(overrides.marginBottom),
    marginLeft: px(overrides.marginLeft),

    // Layout
    width: overrides.width,
    maxWidth: overrides.maxWidth,
    minHeight: overrides.minHeight,
    transform: translate(overrides.offsetX, overrides.offsetY),

    // Visibility
    display: shouldHide(overrides, breakpoint) ? 'none' : undefined,
  }
}

/** Sanitize a blockId to only allow safe characters for CSS selectors */
function sanitizeBlockId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '')
}

/** Sanitize custom CSS to prevent script injection via CSS */
function sanitizeCss(css: string): string {
  // Remove any <script> tags, url() with javascript:, expression(), and @import with javascript
  return css
    .replace(/<\/?script[^>]*>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/@import\s+url\s*\(\s*['"]?\s*javascript/gi, '')
}

/** Build scoped custom CSS for a block */
function buildCustomCssTag(blockId: string, customCss: string | undefined): string {
  if (!customCss) return ''
  const safeId = sanitizeBlockId(blockId)
  const safeCss = sanitizeCss(customCss)
  return safeCss.replace(/\.this/g, `[data-block-id="${safeId}"]`)
}

/** Build the full injected CSS for all blocks (scoped overrides + custom CSS) */
function buildAllInjectedCss(sections: PageSection[]): string {
  const scopedCss = generateAllBlocksCss(
    sections.map((block, index) => {
      const blockData = block as Record<string, unknown>
      return {
        id: (block.id as string) ?? `block-${index}`,
        styleOverrides: blockData.styleOverrides as BlockStyleOverrides | undefined,
        animation: (blockData.animation as string) ?? '',
      }
    }),
  )
  const customCss = sections.map((block, index) => {
    const so = (block as Record<string, unknown>).styleOverrides as BlockStyleOverrides | undefined
    return so?.customCss ? buildCustomCssTag((block.id as string) ?? `block-${index}`, so.customCss) : ''
  }).join('\n')
  return scopedCss + customCss
}

/** Renderuj pojedynczy blok — ten sam switch co BlockRenderer, bez FeaturedProducts (server-only) */
function renderBlock(block: PageSection) {
  switch (block.blockType) {
    case 'hero':
      return <HeroBlock {...block} />
    case 'stats':
      return <StatsBlock {...block} />
    case 'services':
      return <ServicesBlock {...block} />
    case 'featuredProducts':
      // FeaturedProductsBlock jest server component — w preview pokazujemy placeholder
      return (
        <div className="flex items-center justify-center bg-forest-800/50 px-8 py-16 text-cream/60">
          <p className="text-sm">🛒 Blok polecanych produktów (podgląd niedostępny)</p>
        </div>
      )
    case 'about':
      return <AboutBlock {...block} />
    case 'richText':
      return <RichTextBlock {...block} />
    case 'gallery':
      return <GalleryBlock {...block} />
    case 'galleryFull':
      return <GalleryFullBlock {...block} />
    case 'testimonials':
      return <TestimonialsBlock {...block} />
    case 'cta':
      return <CTABlock {...block} />
    case 'faq':
      return <FAQBlock {...block} />
    case 'pricing':
      return <PricingBlock {...block} />
    case 'steps':
      return <StepsBlock {...block} />
    case 'contactForm':
      return <ContactFormBlock {...block} />
    case 'legalText':
      return <LegalTextBlock {...block} />
    case 'partners':
      return <PartnersBlock {...block} />
    case 'team':
      return <TeamBlock {...block} />
    case 'mapArea':
      return <MapAreaBlock {...block} />
    case 'offerCards':
      return <OfferCardsBlock {...block} />
    default:
      return null
  }
}

/** Klient preview — nasłuchuje postMessage od edytora parent window */
export function PreviewClient({ initialSections }: Props) {
  const [sections, setSections] = useState<PageSection[]>(initialSections)
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
  const [spacingInspectorEnabled, setSpacingInspectorEnabled] = useState(false)
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('desktop')
  const [comments, setComments] = useState<BlockComment[]>([])
  const [showComments, setShowComments] = useState(false)
  const blockRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  // IntersectionObserver do triggerowania .visible na entrance animations
  useEffect(() => {
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

    blockRefs.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [sections])

  // Nasłuchuj wiadomości od parent window (edytor)
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const { data } = event
      if (!data?.type) return

      if (data.type === 'editor:sections-updated') {
        setSections(data.sections as PageSection[])
      }

      if (data.type === 'editor:css-overrides') {
        const overrides = data.overrides as Record<string, string> | undefined
        const customCss = data.customCss as string | undefined
        let styleEl = document.getElementById('editor-overrides')
        if (!styleEl) {
          styleEl = document.createElement('style')
          styleEl.id = 'editor-overrides'
          document.head.appendChild(styleEl)
        }
        let css = ':root {\n'
        if (overrides) {
          for (const [key, value] of Object.entries(overrides)) {
            css += `  ${key}: ${value};\n`
          }
        }
        css += '}\n'
        if (customCss) css += customCss
        styleEl.textContent = css
      }

      if (data.type === 'editor:select-block') {
        const index = data.index as number | null
        setHighlightedIndex(index)

        // Scrolluj do wybranego bloku
        if (index !== null) {
          const el = document.getElementById(`editor-block-${index}`)
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' })

          // Usuń podświetlenie po 2.5s
          const timer = setTimeout(() => setHighlightedIndex(null), 2500)
          return () => clearTimeout(timer)
        }
      }

      if (data.type === 'editor:enable-spacing-inspector') {
        setSpacingInspectorEnabled(!!data.enabled)
      }

      if (data.type === 'editor:set-breakpoint') {
        setCurrentBreakpoint((data.breakpoint as string) ?? 'desktop')
      }

      if (data.type === 'editor:comments-updated') {
        setComments((data.comments as BlockComment[]) ?? [])
      }

      if (data.type === 'editor:show-comments') {
        setShowComments(!!data.enabled)
      }
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Kliknięcie bloku → powiadom parent
  const handleBlockClick = useCallback((index: number) => {
    window.parent.postMessage({ type: 'preview:block-clicked', index }, '*')
  }, [])

  // Hover na bloku → wyślij dane spacingów
  const handleBlockHover = useCallback(
    (index: number) => {
      if (!spacingInspectorEnabled) return
      const el = blockRefs.current.get(index)
      if (!el) return

      const style = window.getComputedStyle(el)
      window.parent.postMessage(
        {
          type: 'preview:block-spacing',
          index,
          margin: {
            top: parseFloat(style.marginTop) || 0,
            right: parseFloat(style.marginRight) || 0,
            bottom: parseFloat(style.marginBottom) || 0,
            left: parseFloat(style.marginLeft) || 0,
          },
          padding: {
            top: parseFloat(style.paddingTop) || 0,
            right: parseFloat(style.paddingRight) || 0,
            bottom: parseFloat(style.paddingBottom) || 0,
            left: parseFloat(style.paddingLeft) || 0,
          },
          width: el.offsetWidth,
          height: el.offsetHeight,
          offsetTop: el.offsetTop,
          offsetLeft: el.offsetLeft,
        },
        '*',
      )
    },
    [spacingInspectorEnabled],
  )

  // Helper to set block ref
  const setBlockRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      if (el) blockRefs.current.set(index, el)
      else blockRefs.current.delete(index)
    },
    [],
  )

  return (
    <>
      {/* Inject scoped style overrides for ALL blocks */}
      <style
        id="editor-block-overrides"
        dangerouslySetInnerHTML={{ __html: buildAllInjectedCss(sections) }}
      />

      {sections.map((block, index) => {
        const blockData = block as Record<string, unknown>
        const animKey = (blockData.animation as string) ?? ''
        const animDef = animKey ? ANIMATION_MAP.get(animKey) : undefined
        const animClass = animDef?.className ?? ''
        const delay = (blockData.animationDelay as number) ?? 0
        const duration = (blockData.animationDuration as number) ?? 0
        const so = blockData.styleOverrides as BlockStyleOverrides | undefined
        const blockId = (block.id as string) ?? `block-${index}`
        const blockStyles = buildInlineStyles(so, currentBreakpoint)

        return (
          <div
            key={block.id ?? `block-${index}`}
            id={`editor-block-${index}`}
            data-block-id={blockId}
            ref={setBlockRef(index)}
            onClick={() => handleBlockClick(index)}
            onMouseEnter={() => handleBlockHover(index)}
            className={`relative cursor-pointer transition-all duration-300 ${animClass} ${
              highlightedIndex === index
                ? 'ring-2 ring-accent ring-offset-2 ring-offset-forest-900'
                : ''
            }`}
            style={{
              transitionDelay: delay ? `${delay}ms` : undefined,
              transitionDuration: duration ? `${duration}ms` : undefined,
              animationDelay: delay ? `${delay}ms` : undefined,
              animationDuration: duration ? `${duration}ms` : undefined,
              ...blockStyles,
            }}
          >
            {renderBlock(block)}
            {/* Comment pins */}
            {showComments && comments
              .filter((c) => c.blockIndex === index && c.position && !c.resolved)
              .map((comment) => (
                <div
                  key={comment.id}
                  className="comment-pin"
                  style={{
                    left: `${comment.position!.xPercent}%`,
                    top: `${comment.position!.yPercent}%`,
                  }}
                  title={comment.text}
                />
              ))}
          </div>
        )
      })}
    </>
  )
}
