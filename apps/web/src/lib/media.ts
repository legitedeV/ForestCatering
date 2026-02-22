export function getMediaUrl(image: unknown): string | undefined {
  if (!image || typeof image === 'number' || typeof image === 'string') return undefined
  const media = image as { url?: string | null }
  if (!media.url) return undefined
  // Return relative path — next/image treats these as local (no remotePatterns needed).
  // If Payload returns a full URL, strip the origin so we get just the pathname.
  try {
    const parsed = new URL(media.url)
    return parsed.pathname
  } catch {
    // Already a relative path (e.g. "/api/media/file/image.jpg")
    return media.url
  }
}

export function getMediaAlt(image: unknown, fallback: string): string {
  if (!image || typeof image !== 'object') return fallback
  return (image as { alt?: string }).alt || fallback
}
