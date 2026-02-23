import type { CollectionAfterChangeHook } from 'payload'

export const revalidatePages: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (doc._status !== 'published') {
    return doc
  }

  const slug = doc.slug as string
  const secret = process.env.PAYLOAD_REVALIDATE_SECRET
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  if (!secret) {
    req.payload.logger.warn(`Revalidate skipped for page ${slug}: PAYLOAD_REVALIDATE_SECRET is not set.`)
    return doc
  }

  if (!siteUrl) {
    req.payload.logger.warn(`Revalidate skipped for page ${slug}: NEXT_PUBLIC_SITE_URL is not set.`)
    return doc
  }

  try {
    const body = JSON.stringify({ collection: 'pages', slug })
    const crypto = await import('crypto')
    const signature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')

    const res = await fetch(`${siteUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-payload-signature': signature,
      },
      body,
    })

    if (res.ok) {
      req.payload.logger.info(`Revalidated page: ${slug}`)
    } else {
      req.payload.logger.error(`Revalidation failed for page ${slug}: ${res.status} ${res.statusText}`)
    }
  } catch (err) {
    req.payload.logger.error(`Revalidation failed for page ${slug}: ${err instanceof Error ? err.message : String(err)}`)
  }

  return doc
}
