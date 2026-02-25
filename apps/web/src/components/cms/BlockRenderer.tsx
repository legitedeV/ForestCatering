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

interface Props {
  sections: PageSection[]
}

export function BlockRenderer({ sections }: Props) {
  return (
    <>
      {sections.map((block, index) => {
        const key = block.id ?? `block-${index}`
        switch (block.blockType) {
          case 'hero':
            return <HeroBlock key={key} {...block} />
          case 'stats':
            return <StatsBlock key={key} {...block} />
          case 'services':
            return <ServicesBlock key={key} {...block} />
          case 'featuredProducts':
            return <FeaturedProductsBlock key={key} {...block} />
          case 'about':
            return <AboutBlock key={key} {...block} />
          case 'richText':
            return <RichTextBlock key={key} {...block} />
          case 'gallery':
            return <GalleryBlock key={key} {...block} />
          case 'galleryFull':
            return <GalleryFullBlock key={key} {...block} />
          case 'testimonials':
            return <TestimonialsBlock key={key} {...block} />
          case 'cta':
            return <CTABlock key={key} {...block} />
          case 'faq':
            return <FAQBlock key={key} {...block} />
          case 'pricing':
            return <PricingBlock key={key} {...block} />
          case 'steps':
            return <StepsBlock key={key} {...block} />
          case 'contactForm':
            return <ContactFormBlock key={key} {...block} />
          case 'legalText':
            return <LegalTextBlock key={key} {...block} />
          case 'partners':
            return <PartnersBlock key={key} {...block} />
          case 'team':
            return <TeamBlock key={key} {...block} />
          case 'mapArea':
            return <MapAreaBlock key={key} {...block} />
          case 'offerCards':
            return <OfferCardsBlock key={key} {...block} />
          default:
            return null
        }
      })}
    </>
  )
}
