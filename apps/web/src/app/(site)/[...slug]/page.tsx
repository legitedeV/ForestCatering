import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlockRenderer } from '@/components/cms/BlockRenderer'
import { getMediaUrl } from '@/lib/media'
import { getPayload } from '@/lib/payload-client'
import { getPageByPath, getPublishedPagePaths, pathFromSegments } from '@/lib/cms-pages'
import type { SiteSetting } from '@/payload-types'

interface Props {
  params: Promise<{ slug: string[] }>
}

async function getSiteSettings(): Promise<SiteSetting | null> {
  try {
    const payload = await getPayload()
    return (await payload.findGlobal({ slug: 'site-settings' })) as SiteSetting
  } catch {
    return null
  }
}

export async function generateStaticParams() {
  const paths = await getPublishedPagePaths()
  return paths
    .filter((pagePath) => pagePath !== 'home')
    .map((pagePath) => ({ slug: pagePath.split('/') }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const pagePath = pathFromSegments(slug)
  const [page, settings] = await Promise.all([getPageByPath(pagePath), getSiteSettings()])

  if (!page) {
    return {
      title: settings?.seoDefaults?.metaTitle ?? undefined,
      description: settings?.seoDefaults?.metaDescription ?? undefined,
    }
  }

  const title = page.seo?.metaTitle ?? settings?.seoDefaults?.metaTitle ?? page.title
  const description = page.seo?.metaDescription ?? settings?.seoDefaults?.metaDescription ?? undefined
  const ogImage = getMediaUrl(page.seo?.ogImage ?? settings?.seoDefaults?.ogImage)

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

export default async function CMSPage({ params }: Props) {
  const { slug } = await params
  const pagePath = pathFromSegments(slug)
  if (pagePath === 'home') notFound()

  const page = await getPageByPath(pagePath)

  if (!page?.sections?.length) {
    notFound()
  }

  return <BlockRenderer sections={page.sections} />
}
