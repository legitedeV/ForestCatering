import type { Metadata } from 'next'
import { BlockRenderer } from '@/components/cms/BlockRenderer'
import type { SiteSetting } from '@/payload-types'
import { getMediaUrl } from '@/lib/media'
import { getPayload } from '@/lib/payload-client'
import { getPageBySlug, HOME_SLUG } from '@/lib/cms-pages'

async function getSiteSettings(): Promise<SiteSetting | null> {
  try {
    const payload = await getPayload()
    return (await payload.findGlobal({ slug: 'site-settings' })) as SiteSetting
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPageBySlug(HOME_SLUG), getSiteSettings()])
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
  const page = await getPageBySlug(HOME_SLUG)

  if (!page?.sections || page.sections.length === 0) {
    return <section className="px-4 py-28 text-center text-cream">Brak opublikowanej strony głównej w CMS.</section>
  }

  return <BlockRenderer sections={page.sections} />
}
