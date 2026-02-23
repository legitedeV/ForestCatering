import { draftMode } from 'next/headers'
import { getPayload } from '@/lib/payload-client'
import type { Page } from '@/payload-types'

export const HOME_SLUG = process.env.HOME_PAGE_SLUG || 'home'

export function normalizeSlug(slug: string): string {
  return slug.replace(/^\/+|\/+$/g, '')
}

export function slugFromSegments(segments: string[]): string {
  return normalizeSlug(segments.join('/'))
}

export function isSafeSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:[/-][a-z0-9]+)*$/i.test(slug)
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const normalized = normalizeSlug(slug)
  if (!normalized || !isSafeSlug(normalized)) return null

  try {
    const { isEnabled: isDraft } = await draftMode()
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'pages',
      where: { slug: { equals: normalized } },
      limit: 1,
      depth: 2,
      draft: isDraft,
    })

    return (result.docs[0] as Page) ?? null
  } catch {
    return null
  }
}

export async function getPublishedPageSlugs(): Promise<string[]> {
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'pages',
      where: { _status: { equals: 'published' } },
      depth: 0,
      draft: false,
      limit: 1000,
      pagination: false,
    })

    return result.docs
      .map((doc) => (typeof doc.slug === 'string' ? normalizeSlug(doc.slug) : ''))
      .filter(Boolean)
  } catch {
    return []
  }
}
