import Link from 'next/link';

const footerLinks = [
  { label: 'O nas', href: '#o-nas' },
  { label: 'Usługi', href: '#uslugi' },
  { label: 'Wesela', href: '#wesela' },
  { label: 'Galeria', href: '#galeria' },
  { label: 'Kontakt', href: '#kontakt' },
];

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'Facebook', href: 'https://facebook.com' },
  { label: 'TikTok', href: 'https://tiktok.com' },
];

export default function Footer() {
  return (
    <footer
      className="border-t border-white/[0.06]"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div className="container-site py-16">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Logo & tagline */}
          <div>
            <Link
              href="/"
              className="text-2xl font-bold tracking-[0.1em]"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text-primary)',
              }}
            >
              FOREST
            </Link>
            <p
              className="mt-3 max-w-xs text-sm leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Catering &amp; Bar ze Szczecina. Tworzymy niezapomniane
              doświadczenia kulinarne od ponad dekady.
            </p>
          </div>

          {/* Nav Links */}
          <div>
            <h4
              className="mb-4 text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Nawigacja
            </h4>
            <ul className="flex flex-col gap-2.5">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors hover:text-[var(--color-accent)]"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Social */}
          <div>
            <h4
              className="mb-4 text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Kontakt
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <li>+48 123 456 789</li>
              <li>kontakt@foresthub.pl</li>
              <li>Szczecin, Polska</li>
            </ul>

            <div className="mt-6 flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors hover:text-[var(--color-accent)]"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 text-xs md:flex-row"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <p>&copy; {new Date().getFullYear()} Forest Hub. Wszystkie prawa zastrzeżone.</p>
          <p>
            Made with 🌲
          </p>
        </div>
      </div>
    </footer>
  );
}
