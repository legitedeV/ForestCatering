import { unstable_noStore as noStore } from 'next/cache'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { ToastProvider } from '@/components/ui/Toast'
import { getPayload } from '@/lib/payload-client'
import type { Navigation, SiteSetting } from '@/payload-types'
import { mapHeaderLinks, resolveCompanyName } from '@/components/layout/types'

import { Navbar } from '@/components/layout/Navbar'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getLayoutGlobals(): Promise<{ navigation: Navigation | null; settings: SiteSetting | null }> {
  noStore()
  try {
    const payload = await getPayload()
    const [navigation, settings] = await Promise.all([
      payload.findGlobal({ slug: 'navigation' }),
      payload.findGlobal({ slug: 'site-settings' }),
    ])

    return {
      navigation: navigation as Navigation,
      settings: settings as SiteSetting,
    }
  } catch {
    return { navigation: null, settings: null }
  }
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { navigation, settings } = await getLayoutGlobals()

  return (
    <ToastProvider>
      <Navbar
        links={mapHeaderLinks(navigation)}
        companyName={resolveCompanyName(settings)}
        contactPhone={settings?.phone}
        email={settings?.email}
        socialFacebook={settings?.socialLinks?.facebook}
        socialInstagram={settings?.socialLinks?.instagram}
      />
      <CartDrawer />
      <main className="min-h-screen">{children}</main>
      <Footer navigation={navigation} settings={settings} />
    </ToastProvider>
  )
}
