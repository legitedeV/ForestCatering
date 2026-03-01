import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlockRenderer } from '@/components/cms/BlockRenderer'
import type { SiteSetting } from '@/payload-types'
import { getMediaUrl } from '@/lib/media'
import { getPayload } from '@/lib/payload-client'
import { getPageByPath, HOME_PATH } from '@/lib/cms-pages'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getSiteSettings(): Promise<SiteSetting | null> {
  try {
    const payload = await getPayload()
    return (await payload.findGlobal({ slug: 'site-settings' })) as SiteSetting
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPageByPath(HOME_PATH), getSiteSettings()])
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
  const page = await getPageByPath(HOME_PATH)

  if (!page?.sections || page.sections.length === 0) {
    notFound()
  }

  return <BlockRenderer sections={page.sections} />
}
