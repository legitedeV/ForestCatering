import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const secret = process.env.PAYLOAD_REVALIDATE_SECRET
  if (!secret) {
    return new Response('Server misconfigured', { status: 500 })
  }

  const signature = request.headers.get('x-payload-signature')
  if (!signature) {
    return new Response('Missing signature', { status: 401 })
  }

  let body: string
  try {
    body = await request.text()
  } catch {
    return new Response('Invalid body', { status: 400 })
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  const expectedBuf = Buffer.from(expected)
  const signatureBuf = Buffer.from(signature)

  if (expectedBuf.length !== signatureBuf.length) {
    return new Response('Invalid signature', { status: 401 })
  }

  const isValid = crypto.timingSafeEqual(signatureBuf, expectedBuf)

  if (!isValid) {
    return new Response('Invalid signature', { status: 401 })
  }

  let payload: { collection?: string; slug?: string }
  try {
    payload = JSON.parse(body)
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  if (payload.collection === 'pages') {
    const slug = payload.slug
    if (slug === 'home' || slug === (process.env.HOME_PAGE_SLUG || 'home')) {
      revalidatePath('/')
    }
    if (slug) {
      revalidatePath(`/${slug}`)
    }
  }

  return Response.json({ revalidated: true, now: Date.now() })
}
