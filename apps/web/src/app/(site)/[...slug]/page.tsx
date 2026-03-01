import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlockRenderer } from '@/components/cms/BlockRenderer'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { getMediaUrl } from '@/lib/media'
import { getPayload } from '@/lib/payload-client'
import { getPageByPath, pathFromSegments } from '@/lib/cms-pages'
import type { SiteSetting } from '@/payload-types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

  const breadcrumbItems = slug.map((segment, i) => ({
    label: segment.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase()),
    href: i < slug.length - 1 ? `/${slug.slice(0, i + 1).join('/')}` : undefined,
  }))

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4">
        <Breadcrumbs items={breadcrumbItems} />
      </div>
      <BlockRenderer sections={page.sections} />
    </div>
  )
}
