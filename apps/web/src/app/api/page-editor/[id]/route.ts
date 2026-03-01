import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload-client'

// Walidacja nagłówka x-editor-secret
function validateSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-editor-secret')
  return !!secret && secret === process.env.PAYLOAD_PREVIEW_SECRET
}

// GET — pobranie strony z sekcjami (z draft support)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!validateSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const payload = await getPayload()
    const page = await payload.findByID({
      collection: 'pages',
      id: Number(id),
      depth: 2,
      draft: true,
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: page.id,
      title: page.title,
      slug: page.slug,
      path: page.path,
      sections: page.sections ?? [],
      updatedAt: page.updatedAt,
    })
  } catch (error) {
    console.error('[page-editor GET] Błąd pobierania strony:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT — zapis zmian sekcji (draft)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!validateSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Walidacja: sections musi być tablicą, każdy element musi mieć blockType
  const { sections } = body as { sections?: unknown }

  if (!Array.isArray(sections)) {
    return NextResponse.json({ error: 'sections must be an array' }, { status: 400 })
  }

  for (let i = 0; i < sections.length; i++) {
    const block = sections[i] as Record<string, unknown> | null
    if (!block || typeof block.blockType !== 'string') {
      return NextResponse.json(
        { error: `sections[${i}] must have a valid blockType` },
        { status: 400 },
      )
    }
  }

  try {
    const payload = await getPayload()
    const updated = await payload.update({
      collection: 'pages',
      id: Number(id),
      data: { sections },
      draft: true,
    })

    return NextResponse.json({
      success: true,
      updatedAt: updated.updatedAt,
    })
  } catch (error) {
    console.error('[page-editor PUT] Błąd zapisu strony:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
