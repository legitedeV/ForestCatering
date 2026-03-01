'use client'

import { useEffect, useState, useCallback } from 'react'
import type { PageSection } from '@/components/cms/types'

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

  // Nasłuchuj wiadomości od parent window (edytor)
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const { data } = event
      if (!data?.type) return

      if (data.type === 'editor:sections-updated') {
        setSections(data.sections as PageSection[])
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
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Kliknięcie bloku → powiadom parent
  const handleBlockClick = useCallback((index: number) => {
    window.parent.postMessage({ type: 'preview:block-clicked', index }, '*')
  }, [])

  return (
    <>
      {sections.map((block, index) => (
        <div
          key={block.id ?? `block-${index}`}
          id={`editor-block-${index}`}
          onClick={() => handleBlockClick(index)}
          className={`relative cursor-pointer transition-all duration-300 ${
            highlightedIndex === index
              ? 'ring-2 ring-accent ring-offset-2 ring-offset-forest-900'
              : ''
          }`}
        >
          {renderBlock(block)}
        </div>
      ))}
    </>
  )
}
