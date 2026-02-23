import Link from 'next/link'
import type { Navigation, SiteSetting } from '@/payload-types'

interface FooterProps {
  navigation: Navigation | null
  settings: SiteSetting | null
}

function toHref(url: string): string {
  if (!url) return '#'
  return url.startsWith('/') || url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:') ? url : `/${url}`
}

export function Footer({ navigation, settings }: FooterProps) {
  const companyName = settings?.companyName?.trim() || 'Forest Catering'
  const addressParts = [settings?.address?.street, settings?.address?.postalCode, settings?.address?.city].filter(Boolean)
  const phone = settings?.phone?.trim()
  const email = settings?.email?.trim()
  const facebook = settings?.socialLinks?.facebook?.trim()
  const instagram = settings?.socialLinks?.instagram?.trim()

  return (
    <footer className="border-t border-forest-800 bg-forest-950">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="text-xl font-bold text-cream">🌲 {companyName}</Link>
            {settings?.businessHours && (
              <p className="mt-4 text-sm leading-relaxed whitespace-pre-line text-forest-300">{settings.businessHours}</p>
            )}
            <div className="mt-6 flex gap-4">
              {facebook && <a href={toHref(facebook)} aria-label="Facebook" className="text-forest-300 transition hover:text-accent">Facebook</a>}
              {instagram && <a href={toHref(instagram)} aria-label="Instagram" className="text-forest-300 transition hover:text-accent">Instagram</a>}
            </div>
          </div>

          {(navigation?.footerColumns ?? []).map((column) => (
            <div key={column.id ?? column.title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cream">{column.title}</h3>
              <ul className="space-y-3">
                {(column.links ?? []).map((link) => (
                  <li key={link.id ?? `${link.url}-${link.label}`}>
                    <Link href={toHref(link.url)} className="text-sm text-forest-300 transition hover:text-cream">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cream">Kontakt</h3>
            <ul className="space-y-3">
              {addressParts.length > 0 && <li className="text-sm text-forest-300">📍 {addressParts.join(', ')}</li>}
              {phone && <li><a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-sm text-forest-300 transition hover:text-cream">📞 {phone}</a></li>}
              {email && <li><a href={`mailto:${email}`} className="text-sm text-forest-300 transition hover:text-cream">✉️ {email}</a></li>}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-forest-900 bg-forest-950 py-6">
        <p className="text-center text-sm text-forest-400">© {companyName}. Wszelkie prawa zastrzeżone.</p>
      </div>
    </footer>
  )
}
