import type { PageSection } from './types'
import { HeroBlock } from './blocks/HeroBlock'
import { RichTextBlock } from './blocks/RichTextBlock'
import { GalleryBlock } from './blocks/GalleryBlock'
import { CTABlock } from './blocks/CTABlock'
import { FAQBlock } from './blocks/FAQBlock'
import { StatsBlock } from './blocks/StatsBlock'
import { ServicesBlock } from './blocks/ServicesBlock'
import { FeaturedProductsBlock } from './blocks/FeaturedProductsBlock'
import { AboutBlock } from './blocks/AboutBlock'
import { TestimonialsBlock } from './blocks/TestimonialsBlock'
import { PricingBlock } from './blocks/PricingBlock'
import { StepsBlock } from './blocks/StepsBlock'
import { ContactFormBlock } from './blocks/ContactFormBlock'
import { LegalTextBlock } from './blocks/LegalTextBlock'
import { GalleryFullBlock } from './blocks/GalleryFullBlock'
import { PartnersBlock } from './blocks/PartnersBlock'
import { TeamBlock } from './blocks/TeamBlock'
import { MapAreaBlock } from './blocks/MapAreaBlock'
import { OfferCardsBlock } from './blocks/OfferCardsBlock'
import { ANIMATION_CATALOG } from '@/lib/animation-catalog'

const ANIMATION_MAP = new Map(ANIMATION_CATALOG.map((a) => [a.key, a]))

interface Props {
  sections: PageSection[]
}

export function BlockRenderer({ sections }: Props) {
  return (
    <>
      {sections.map((block, index) => {
        const key = block.id ?? `block-${index}`
        const blockData = block as Record<string, unknown>
        const animKey = (blockData.animation as string) ?? ''
        const animDef = animKey ? ANIMATION_MAP.get(animKey) : undefined
        const animClass = animDef?.className ?? ''
        const duration = (blockData.animationDuration as number) ?? 0
        const delay = (blockData.animationDelay as number) ?? 0
        const easing = (blockData.animationEasing as string) ?? ''
        const iterations = (blockData.animationIterations as string) ?? ''

        const blockEl = (() => {
          switch (block.blockType) {
            case 'hero':
              return <HeroBlock {...block} />
            case 'stats':
              return <StatsBlock {...block} />
            case 'services':
              return <ServicesBlock {...block} />
            case 'featuredProducts':
              return <FeaturedProductsBlock {...block} />
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
        })()

        if (!animClass && !duration && !delay && !easing && !iterations) {
          return <div key={key} data-block-id={block.id ?? `block-${index}`}>{blockEl}</div>
        }

        return (
          <div
            key={key}
            data-block-id={block.id ?? `block-${index}`}
            className={animClass || undefined}
            style={{
              '--ve-anim-duration': duration ? `${duration}ms` : undefined,
              '--ve-anim-delay': delay ? `${delay}ms` : undefined,
              '--ve-anim-easing': easing || undefined,
              '--ve-anim-iter': iterations || undefined,
            } as React.CSSProperties}
          >
            {blockEl}
          </div>
        )
      })}
    </>
  )
}
