import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'
import { getPayload } from '@/lib/payload-client'

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  const slug = request.nextUrl.searchParams.get('slug')

  if (!secret || !slug) {
    return new Response('Missing secret or slug', { status: 400 })
  }

  if (secret !== process.env.PAYLOAD_PREVIEW_SECRET) {
    return new Response('Invalid secret', { status: 401 })
  }

  // Verify the page actually exists in Payload
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      draft: true,
    })
    if (!result.docs[0]) {
      return new Response('Page not found', { status: 404 })
    }
  } catch {
    return new Response('Failed to verify page', { status: 500 })
  }

  const draft = await draftMode()
  draft.enable()

  const path = slug === 'home' ? '/' : `/${slug}`
  redirect(path)
}
