'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useScroll, useTransform } from 'framer-motion'
import { MobileMenu } from './MobileMenu'
import { useCart } from '@/lib/cart-store'

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
  const pathname = usePathname()
  const isHome = pathname === '/'
  const { itemCount } = useCart()
  const { scrollY } = useScroll()
  const bgOpacity = useTransform(scrollY, [0, 100], [isHome ? 0 : 1, 1])
  const borderOpacity = useTransform(scrollY, [0, 100], [isHome ? 0 : 0.3, 0.3])

  return (
    <motion.header
      className="fixed top-0 right-0 left-0 z-50"
      style={{
        backgroundColor: useTransform(bgOpacity, (v) => `rgba(8, 28, 21, ${v * 0.95})`),
        borderBottomColor: useTransform(borderOpacity, (v) => `rgba(10, 42, 27, ${v})`),
        borderBottomWidth: '1px',
        backdropFilter: useTransform(bgOpacity, (v) => (v > 0.5 ? 'blur(12px)' : 'none')),
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-cream">
          🌲 Forest Catering
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-cream/80 transition hover:text-accent"
            >
              {link.label}
              {pathname.startsWith(link.href) && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-1 left-0 h-0.5 w-full bg-accent"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Cart + hamburger */}
        <div className="flex items-center gap-4">
          <Link
            href="/koszyk"
            className="relative text-cream/80 transition hover:text-cream"
            aria-label="Koszyk"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-forest-950">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            className="text-cream md:hidden"
            aria-label="Otwórz menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} links={navLinks} />
    </motion.header>
  )
}
