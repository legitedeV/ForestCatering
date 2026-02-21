export function getMediaUrl(image: unknown): string | undefined {
  if (!image || typeof image === 'number' || typeof image === 'string') return undefined
  const media = image as { url?: string | null }
  if (!media.url) return undefined
  if (media.url.startsWith('/')) {
    const base = process.env.NEXT_PUBLIC_SITE_URL || ''
    return base ? `${base}${media.url}` : media.url
  }
  return media.url
}

export function getMediaAlt(image: unknown, fallback: string): string {
  if (!image || typeof image !== 'object') return fallback
  return (image as { alt?: string })?.alt || fallback
}
