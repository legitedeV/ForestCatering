import { notFound } from 'next/navigation'
import { BlockRenderer } from '@/components/cms/BlockRenderer'
import { getPageBySlug } from '@/lib/cms-pages'

export default async function KontaktPage() {
  const page = await getPageBySlug('kontakt')

  if (!page?.sections?.length) {
    notFound()
  }

  return <BlockRenderer sections={page.sections} />
}
