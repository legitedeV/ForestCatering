import type { CollectionAfterChangeHook } from 'payload'

export const revalidatePages: CollectionAfterChangeHook = async ({ doc, req }) => {
  // Tylko opublikowane dokumenty (nie drafty)
  if (doc._status === 'published') {
    const slug = doc.slug as string
    const secret = process.env.PAYLOAD_REVALIDATE_SECRET
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    if (secret && siteUrl) {
      try {
        const body = JSON.stringify({ collection: 'pages', slug })
        const crypto = await import('crypto')
        const signature = crypto
          .createHmac('sha256', secret)
          .update(body)
          .digest('hex')

        await fetch(`${siteUrl}/api/revalidate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-payload-signature': signature,
          },
          body,
        })
        req.payload.logger.info(`Revalidated page: ${slug}`)
      } catch (err) {
        req.payload.logger.error(`Revalidation failed for page ${slug}: ${err}`)
      }
    }
  }
  return doc
}
