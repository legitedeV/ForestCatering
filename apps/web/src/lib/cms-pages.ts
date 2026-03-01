import { unstable_noStore as noStore } from 'next/cache'
import { draftMode } from 'next/headers'
import { getPayload } from '@/lib/payload-client'
import type { Page } from '@/payload-types'

export const HOME_PATH = process.env.HOME_PAGE_SLUG || 'home'

export function normalizePath(pathValue: string): string {
  return pathValue
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/\/+/g, '/')
    .replace(/^\/|\/$/g, '')
}

export function pathFromSegments(segments: string[]): string {
  return normalizePath(segments.join('/'))
}

export function isSafePath(pathValue: string): boolean {
  return /^[a-z0-9]+(?:[/-][a-z0-9]+)*$/i.test(pathValue)
}

async function getDraftEnabled(): Promise<boolean> {
  const { isEnabled } = await draftMode()
  return isEnabled
}

export async function getPageByPath(pathValue: string): Promise<Page | null> {
  noStore()
  const normalized = normalizePath(pathValue)
  if (!normalized || !isSafePath(normalized)) return null

  try {
    const isDraft = await getDraftEnabled()
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'pages',
      where: { path: { equals: normalized } },
      limit: 1,
      depth: 2,
      draft: isDraft,
    })

    return (result.docs[0] as Page) ?? null
  } catch {
    return null
  }
}

export async function getPublishedPagePaths(): Promise<string[]> {
  noStore()
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
      .map((doc) => {
        const pagePath = (doc as { path?: unknown }).path
        return typeof pagePath === 'string' ? normalizePath(pagePath) : ''
      })
      .filter(Boolean)
  } catch {
    return []
  }
}
