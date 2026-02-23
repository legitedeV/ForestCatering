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

export type PageSection = ExistingPageSection | PricingSection | StepsSection | ContactFormSection | LegalTextSection | GalleryFullSection
