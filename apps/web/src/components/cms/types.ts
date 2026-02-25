import type { Page } from '@/payload-types'

type ExistingPageSection = NonNullable<Page['sections']>[number]

type PricingSection = {
  id?: string
  blockType: 'pricing'
  heading?: string | null
  subheading?: string | null
  packages?: Array<{
    id?: string
    name: string
    price: string
    featured?: boolean | null
    ctaText?: string | null
    ctaLink?: string | null
    features?: Array<{ id?: string; text: string }>
  }> | null
}

type StepsSection = {
  id?: string
  blockType: 'steps'
  heading?: string | null
  steps?: Array<{ id?: string; emoji: string; title: string; description: string }> | null
}

type ContactFormSection = {
  id?: string
  blockType: 'contactForm'
  heading?: string | null
  subheading?: string | null
}

type LegalTextSection = {
  id?: string
  blockType: 'legalText'
  heading?: string | null
  effectiveDate?: string | null
  content: Record<string, unknown>
}

type GalleryFullSection = {
  id?: string
  blockType: 'galleryFull'
  heading?: string | null
  items?: Array<{
    id?: string
    image?: number | { url?: string | null } | null
    alt?: string | null
    category?: string | null
    categoryLabel?: string | null
  }> | null
}

type PartnersSection = {
  id?: string
  blockType: 'partners'
  heading: string
  variant?: 'grid' | 'carousel' | null
  grayscale?: boolean | null
  items: Array<{
    id?: string
    logo: number | { url?: string | null } | null
    name: string
    url?: string | null
  }>
}

type TeamSection = {
  id?: string
  blockType: 'team'
  heading?: string | null
  people: Array<{
    id?: string
    photo: number | { url?: string | null } | null
    name: string
    role: string
    bio?: string | null
    socials?: Array<{
      id?: string
      label: string
      url: string
    }> | null
  }>
}

type MapAreaSection = {
  id?: string
  blockType: 'mapArea'
  heading?: string | null
  description?: string | null
  embedUrl: string
  cities?: Array<{ id?: string; name: string }> | null
  note?: string | null
}

type OfferCardsSection = {
  id?: string
  blockType: 'offerCards'
  heading?: string | null
  cards: Array<{
    id?: string
    title: string
    priceFrom?: string | null
    badge?: string | null
    featured?: boolean | null
    ctaText?: string | null
    ctaLink?: string | null
    features: Array<{ id?: string; text: string }>
  }>
}

export type PageSection = ExistingPageSection | PricingSection | StepsSection | ContactFormSection | LegalTextSection | GalleryFullSection | PartnersSection | TeamSection | MapAreaSection | OfferCardsSection
