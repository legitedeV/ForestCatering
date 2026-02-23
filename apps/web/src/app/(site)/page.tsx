import { draftMode } from 'next/headers'
import type { Metadata } from 'next'
import { getPayload } from '@/lib/payload-client'
import { BlockRenderer } from '@/components/cms/BlockRenderer'
import type { Page, SiteSetting } from '@/payload-types'
import { getMediaUrl } from '@/lib/media'

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

async function getSiteSettings(): Promise<SiteSetting | null> {
  try {
    const payload = await getPayload()
    return await payload.findGlobal({ slug: 'site-settings' }) as SiteSetting
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getHomePage(), getSiteSettings()])
  const title = page?.seo?.metaTitle ?? settings?.seoDefaults?.metaTitle ?? undefined
  const description = page?.seo?.metaDescription ?? settings?.seoDefaults?.metaDescription ?? undefined
  const ogImage = getMediaUrl(page?.seo?.ogImage ?? settings?.seoDefaults?.ogImage)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  }
}

export default async function HomePage() {
  const page = await getHomePage()

  if (!page?.sections || page.sections.length === 0) {
    return <section className="px-4 py-28 text-center text-cream">Brak opublikowanej strony głównej w CMS.</section>
  }

  return <BlockRenderer sections={page.sections} />
}
