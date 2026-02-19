import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-forest-800 bg-forest-950">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1 — Brand */}
          <div>
            <Link href="/" className="text-xl font-bold text-cream">🌲 Forest Catering</Link>
            <p className="mt-4 text-sm leading-relaxed text-forest-300">
              Profesjonalny catering i obsługa eventów w Szczecinie. Tworzymy wyjątkowe doświadczenia kulinarne.
            </p>
            <div className="mt-6 flex gap-4">
              {/* Facebook */}
              <a href="#" aria-label="Facebook" className="text-forest-300 transition hover:text-accent">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
              </a>
              {/* Instagram */}
              <a href="#" aria-label="Instagram" className="text-forest-300 transition hover:text-accent">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
            </div>
          </div>

          {/* Col 2 — Usługi */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cream">Usługi</h3>
            <ul className="space-y-3">
              <li><Link href="/sklep" className="text-sm text-forest-300 transition hover:text-cream">Sklep</Link></li>
              <li><Link href="/oferta" className="text-sm text-forest-300 transition hover:text-cream">Oferta</Link></li>
              <li><Link href="/eventy" className="text-sm text-forest-300 transition hover:text-cream">Eventy</Link></li>
            </ul>
          </div>

          {/* Col 3 — Informacje */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cream">Informacje</h3>
            <ul className="space-y-3">
              <li><Link href="/blog" className="text-sm text-forest-300 transition hover:text-cream">Blog</Link></li>
              <li><Link href="/galeria" className="text-sm text-forest-300 transition hover:text-cream">Galeria</Link></li>
              <li><Link href="/regulamin" className="text-sm text-forest-300 transition hover:text-cream">Regulamin</Link></li>
              <li><Link href="/polityka-prywatnosci" className="text-sm text-forest-300 transition hover:text-cream">Polityka prywatności</Link></li>
            </ul>
          </div>

          {/* Col 4 — Kontakt */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cream">Kontakt</h3>
            <ul className="space-y-3">
              <li className="text-sm text-forest-300">📍 ul. Leśna 42, 70-001 Szczecin</li>
              <li><a href="tel:+48123456789" className="text-sm text-forest-300 transition hover:text-cream">📞 +48 123 456 789</a></li>
              <li><a href="mailto:kontakt@forestcatering.pl" className="text-sm text-forest-300 transition hover:text-cream">✉️ kontakt@forestcatering.pl</a></li>
              <li className="text-sm text-forest-300">🕐 Pon-Pt: 8:00-18:00, Sob: 9:00-14:00</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-forest-900 bg-forest-950 py-6">
        <p className="text-center text-sm text-forest-400">
          © 2026 Forest Catering. Wszelkie prawa zastrzeżone.
        </p>
      </div>
    </footer>
  )
}
