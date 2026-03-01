import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload-client'
import { PreviewClient } from './PreviewClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ secret?: string }>
}

/** Strona preview — renderowana w iframe edytora */
export default async function PreviewPage({ params, searchParams }: Props) {
  const { id } = await params
  const { secret } = await searchParams

  // Weryfikacja sekretu
  if (secret !== process.env.PAYLOAD_PREVIEW_SECRET) {
    notFound()
  }

  const payload = await getPayload()

  let page
  try {
    page = await payload.findByID({
      collection: 'pages',
      id: Number(id),
      depth: 2,
      draft: true,
    })
  } catch {
    notFound()
  }

  if (!page) {
    notFound()
  }

  const sections = (page.sections ?? []) as import('@/components/cms/types').PageSection[]

  return (
    <main className="min-h-screen bg-forest-900">
      <PreviewClient initialSections={sections} />
    </main>
  )
}
