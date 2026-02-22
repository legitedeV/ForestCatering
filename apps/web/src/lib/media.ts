export function getMediaUrl(image: unknown): string | undefined {
  if (!image) return undefined

  // Unresolved relation — Payload returned a raw ID instead of a populated object.
  if (typeof image === 'number') {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[getMediaUrl] Received a numeric media ID (${image}) — ensure depth is set to populate the relation.`)
    }
    return undefined
  }

  // Direct URL string (e.g. from Payload or manual entry) — treat as a valid URL.
  if (typeof image === 'string') {
    try {
      const parsed = new URL(image)
      return parsed.pathname
    } catch {
      return image
    }
  }

  const media = image as { url?: string | null }
  if (!media.url) return undefined
  // Return relative path — next/image treats these as local (no remotePatterns needed).
  // If Payload returns a full URL, strip the origin so we get just the pathname.
  let urlStr: string
  try {
    const parsed = new URL(media.url)
    urlStr = parsed.pathname
  } catch {
    // Already a relative path (e.g. "/api/media/file/image.jpg")
    urlStr = media.url
  }
  // Backward compat: old records created before staticURL was set still carry
  // the Payload REST-endpoint prefix. Rewrite to the public directory path.
  if (urlStr.startsWith('/api/media/file/')) {
    urlStr = urlStr.replace('/api/media/file/', '/media/')
  }
  return urlStr
}

export function getMediaAlt(image: unknown, fallback: string): string {
  if (!image || typeof image !== 'object') return fallback
  return (image as { alt?: string }).alt || fallback
}
