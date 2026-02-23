import { notFound } from 'next/navigation'
import { BlockRenderer } from '@/components/cms/BlockRenderer'
import { getPageBySlug } from '@/lib/cms-pages'

export default async function RegulaminPage() {
  const page = await getPageBySlug('regulamin')

  if (!page?.sections?.length) {
    notFound()
  }

  return <BlockRenderer sections={page.sections} />
}
