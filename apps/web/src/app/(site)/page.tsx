import type { Metadata } from 'next'
import Link from 'next/link'
import { BlockRenderer } from '@/components/cms/BlockRenderer'
import type { SiteSetting } from '@/payload-types'
import { getMediaUrl } from '@/lib/media'
import { getPayload } from '@/lib/payload-client'
import { getPageByPath, HOME_PATH } from '@/lib/cms-pages'

async function getSiteSettings(): Promise<SiteSetting | null> {
  try {
    const payload = await getPayload()
    return (await payload.findGlobal({ slug: 'site-settings' })) as SiteSetting
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPageByPath(HOME_PATH), getSiteSettings()])
  const title = page?.seo?.metaTitle ?? settings?.seoDefaults?.metaTitle ?? undefined
  const description = page?.seo?.metaDescription ?? settings?.seoDefaults?.metaDescription ?? undefined
  const ogImage = getMediaUrl(page?.seo?.ogImage ?? settings?.seoDefaults?.ogImage)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  }
}

export default async function HomePage() {
  const [page, settings] = await Promise.all([getPageByPath(HOME_PATH), getSiteSettings()])

  if (!page?.sections || page.sections.length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      return (
        <section className="mx-auto max-w-3xl px-4 py-24 text-center text-cream">
          <h1 className="mb-4 text-3xl font-semibold">Brak opublikowanej strony home w CMS.</h1>
          <p className="mb-6 text-cream/80">Utwórz lub opublikuj stronę z path = &quot;home&quot; w panelu Payload.</p>
          <Link href="/admin" className="inline-flex rounded-full bg-cream px-6 py-3 text-sm font-semibold text-forest-900">
            Przejdź do /admin
          </Link>
        </section>
      )
    }

    return (
      <section className="px-4 py-24 text-center text-cream">
        <h1 className="mb-4 text-3xl font-semibold">{settings?.companyName || 'Forest Catering'}</h1>
        <p className="mb-6 text-cream/80">Skontaktuj się z nami, aby przygotować indywidualną ofertę cateringu.</p>
        <Link href="/kontakt" className="inline-flex rounded-full bg-cream px-6 py-3 text-sm font-semibold text-forest-900">
          Skontaktuj się
        </Link>
      </section>
    )
  }

  return <BlockRenderer sections={page.sections} />
}
