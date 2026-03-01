import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload-client'

function validateSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-editor-secret')
  return !!secret && secret === process.env.PAYLOAD_PREVIEW_SECRET
}

// POST /api/page-editor/[id]/versions/[versionId]/restore
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> },
) {
  if (!validateSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { versionId } = await params

  try {
    const payload = await getPayload()
    const restored = await payload.restoreVersion({ collection: 'pages', id: versionId })
    return NextResponse.json({
      success: true,
      restoredId: restored.id,
      updatedAt: (restored as Record<string, unknown>).updatedAt,
    })
  } catch (error) {
    console.error('[page-editor restore] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
