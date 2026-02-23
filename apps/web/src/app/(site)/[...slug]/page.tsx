import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlockRenderer } from '@/components/cms/BlockRenderer'
import { getMediaUrl } from '@/lib/media'
import { getPublishedPageSlugs, getPageBySlug, slugFromSegments } from '@/lib/cms-pages'

interface Props {
  params: Promise<{ slug: string[] }>
}

export async function generateStaticParams() {
  const slugs = await getPublishedPageSlugs()
  return slugs
    .filter((slug) => slug !== 'home')
    .map((slug) => ({ slug: slug.split('/') }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const pageSlug = slugFromSegments(slug)
  const page = await getPageBySlug(pageSlug)

  if (!page) return {}

  const title = page.seo?.metaTitle ?? page.title
  const description = page.seo?.metaDescription ?? undefined
  const ogImage = getMediaUrl(page.seo?.ogImage)

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
  const pageSlug = slugFromSegments(slug)
  if (pageSlug === 'home') notFound()

  const page = await getPageBySlug(pageSlug)

  if (!page?.sections?.length) {
    notFound()
  }

  return <BlockRenderer sections={page.sections} />
}
