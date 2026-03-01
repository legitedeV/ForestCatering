'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useCartItemCount } from '@/lib/cart-store'
import type { NavLinkItem } from './types'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  links: NavLinkItem[]
  contactPhone?: string | null
  email?: string | null
  socialFacebook?: string | null
  socialInstagram?: string | null
}

export function MobileMenu({ open, onClose, links, contactPhone, email, socialFacebook, socialInstagram }: MobileMenuProps) {
  const itemCount = useCartItemCount()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-forest-950/80 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-forest-950/98 md:hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-cream"
              aria-label="Zamknij menu"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <nav className="flex flex-col items-center gap-6">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="text-2xl font-medium text-cream transition hover:text-accent-warm"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + links.length * 0.05 }}
              >
                <Link
                  href="/koszyk"
                  onClick={onClose}
                  className="text-2xl font-medium text-cream transition hover:text-accent-warm"
                >
                  Koszyk {itemCount > 0 && `(${itemCount})`}
                </Link>
              </motion.div>
            </nav>

            <div className="my-6 h-px w-24 bg-forest-700" />

            <motion.div
              className="absolute bottom-10 flex flex-col items-center gap-3 text-forest-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {contactPhone && (
                <a href={`tel:${contactPhone.replace(/\s+/g, '')}`} className="text-sm transition hover:text-accent-warm">📞 {contactPhone}</a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="text-sm transition hover:text-accent-warm">✉️ {email}</a>
              )}
              {(socialFacebook || socialInstagram) && (
                <div className="mt-2 flex gap-4">
                  {socialFacebook && (
                    <a href={socialFacebook} aria-label="Facebook" className="text-sm transition hover:text-accent-warm">Facebook</a>
                  )}
                  {socialInstagram && (
                    <a href={socialInstagram} aria-label="Instagram" className="text-sm transition hover:text-accent-warm">Instagram</a>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
