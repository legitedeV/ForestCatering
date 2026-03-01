import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload-client'

function validateSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-editor-secret')
  return !!secret && secret === process.env.PAYLOAD_PREVIEW_SECRET
}

// GET /api/page-editor/[id]/versions/[versionId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> },
) {
  if (!validateSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { versionId } = await params

  try {
    const payload = await getPayload()
    const version = await payload.findVersionByID({ collection: 'pages', id: versionId, depth: 1 })
    if (!version) return NextResponse.json({ error: 'Version not found' }, { status: 404 })

    return NextResponse.json({
      id: version.id,
      createdAt: version.createdAt,
      version: {
        title: (version.version as Record<string, unknown>)?.title,
        sections: (version.version as Record<string, unknown>)?.sections ?? [],
      },
    })
  } catch (error) {
    console.error('[page-editor version detail] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
