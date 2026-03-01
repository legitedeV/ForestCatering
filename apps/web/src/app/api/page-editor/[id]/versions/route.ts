import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload-client'

function validateSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-editor-secret')
  return !!secret && secret === process.env.PAYLOAD_PREVIEW_SECRET
}

// GET /api/page-editor/[id]/versions?limit=20
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!validateSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const limit = Number(request.nextUrl.searchParams.get('limit') ?? '20')

  try {
    const payload = await getPayload()
    const versions = await payload.findVersions({
      collection: 'pages',
      where: { parent: { equals: Number(id) } },
      sort: '-createdAt',
      limit,
      depth: 1,
    })

    const simplified = versions.docs.map((v) => ({
      id: v.id,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
      status: (v.version as unknown as Record<string, unknown>)?._status ?? 'draft',
      title: (v.version as unknown as Record<string, unknown>)?.title ?? '',
      sectionsCount: ((v.version as unknown as Record<string, unknown>)?.sections as unknown[] | undefined)?.length ?? 0,
    }))

    return NextResponse.json({ versions: simplified, totalDocs: versions.totalDocs })
  } catch (error) {
    console.error('[page-editor versions GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
