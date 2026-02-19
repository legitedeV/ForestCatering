'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MobileMenu } from './MobileMenu'

const navLinks = [
  { label: 'Sklep', href: '/sklep' },
  { label: 'Oferta', href: '/oferta' },
  { label: 'Eventy', href: '/eventy' },
  { label: 'Galeria', href: '/galeria' },
  { label: 'Blog', href: '/blog' },
  { label: 'Kontakt', href: '/kontakt' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-forest-800 bg-forest-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-white">
          🌲 Forest Catering
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-forest-200 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Cart placeholder + hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href="/koszyk"
            className="text-forest-200 transition hover:text-white"
            aria-label="Koszyk"
          >
            🛒
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            className="text-white md:hidden"
            aria-label="Otwórz menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} links={navLinks} />
    </header>
  )
}
