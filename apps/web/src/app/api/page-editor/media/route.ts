import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload-client'
import type { Where } from 'payload'

function validateSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-editor-secret')
  return !!secret && secret === process.env.PAYLOAD_PREVIEW_SECRET
}

export async function GET(request: NextRequest) {
  if (!validateSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const search = request.nextUrl.searchParams.get('search') ?? ''

  try {
    const payload = await getPayload()

    const where: Where = {}
    if (search.trim()) {
      where.or = [
        { alt: { contains: search } },
        { filename: { contains: search } },
      ]
    }

    const result = await payload.find({
      collection: 'media',
      where,
      limit: 24,
      sort: '-createdAt',
      depth: 0,
    })

    return NextResponse.json({
      docs: result.docs.map((doc) => ({
        id: doc.id,
        alt: doc.alt,
        url: doc.url,
        thumbnailURL: doc.thumbnailURL,
        filename: doc.filename,
        sizes: doc.sizes,
      })),
    })
  } catch (error) {
    console.error('[page-editor media] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
