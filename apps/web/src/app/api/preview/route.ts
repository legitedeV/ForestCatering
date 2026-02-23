import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'
import { getPayload } from '@/lib/payload-client'

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  const path = request.nextUrl.searchParams.get('path') ?? request.nextUrl.searchParams.get('slug')

  if (!secret || !path) {
    return new Response('Missing secret or path', { status: 400 })
  }

  if (secret !== process.env.PAYLOAD_PREVIEW_SECRET) {
    return new Response('Invalid secret', { status: 401 })
  }

  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'pages',
      where: { path: { equals: path } },
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

  const redirectPath = path === 'home' ? '/' : `/${path}`
  redirect(redirectPath)
}
