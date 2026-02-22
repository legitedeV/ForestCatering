import { draftMode } from 'next/headers'
import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload-client'
import { BlockRenderer } from '@/components/cms/BlockRenderer'
import type { Page } from '@/payload-types'
import HardcodedHomePage from './HardcodedHomePage'

const HOME_SLUG = process.env.HOME_PAGE_SLUG || 'home'

async function getHomePage(): Promise<Page | null> {
  try {
    const { isEnabled: isDraft } = await draftMode()
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'pages',
      where: { slug: { equals: HOME_SLUG } },
      limit: 1,
      depth: 2,
      draft: isDraft,
    })
    return (result.docs[0] as Page) ?? null
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomePage()
  if (!page?.seo) return {}
  return {
    title: page.seo.metaTitle ?? undefined,
    description: page.seo.metaDescription ?? undefined,
  }
}

export default async function HomePage() {
  const page = await getHomePage()

  if (!page?.sections || page.sections.length === 0) {
    return <HardcodedHomePage />
  }

  return <BlockRenderer sections={page.sections} />
}
