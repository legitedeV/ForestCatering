import Link from 'next/link'

const footerColumns = [
  {
    title: 'O nas',
    links: [
      { label: 'Nasza historia', href: '/o-nas' },
      { label: 'Zespół', href: '/zespol' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Usługi',
    links: [
      { label: 'Catering firmowy', href: '/oferta' },
      { label: 'Wesela', href: '/eventy' },
      { label: 'Bar mobilny', href: '/eventy' },
    ],
  },
  {
    title: 'Informacje',
    links: [
      { label: 'Dostawa', href: '/dostawa' },
      { label: 'Regulamin', href: '/regulamin' },
      { label: 'Polityka prywatności', href: '/prywatnosc' },
    ],
  },
  {
    title: 'Kontakt',
    links: [
      { label: 'kontakt@forestcatering.pl', href: 'mailto:kontakt@forestcatering.pl' },
      { label: '+48 XXX XXX XXX', href: 'tel:+48000000000' },
      { label: 'Szczecin, Polska', href: '#' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-forest-100 bg-forest-900 text-forest-200">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('mailto:') || link.href.startsWith('tel:') || link.href === '#' ? (
                      <a
                        href={link.href}
                        className="text-sm text-forest-300 transition hover:text-white"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-forest-300 transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-forest-800 pt-6 text-center text-sm text-forest-400">
          © {new Date().getFullYear()} Forest Catering. Wszelkie prawa zastrzeżone.
        </div>
      </div>
    </footer>
  )
}
