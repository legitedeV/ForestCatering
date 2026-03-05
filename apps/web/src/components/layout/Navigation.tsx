'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

const navLinks = [
  { label: 'O nas', href: '#o-nas' },
  { label: 'Usługi', href: '#uslugi' },
  { label: 'Wesela', href: '#wesela' },
  { label: 'Galeria', href: '#galeria' },
  { label: 'Kontakt', href: '#kontakt' },
];

export default function Navigation() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const diff = latest - lastScrollY.current;
    setHidden(diff > 0 && latest > 100);
    setScrolled(latest > 50);
    lastScrollY.current = latest;
  });

  // Close mobile menu on resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <>
      <motion.header
        className="fixed left-0 right-0 top-0 z-[var(--z-header)]"
        initial={{ y: 0 }}
        animate={{ y: hidden && !mobileOpen ? '-100%' : '0%' }}
        transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
      >
        <nav
          className="transition-colors duration-300"
          style={{
            backgroundColor: scrolled
              ? 'rgba(10, 10, 10, 0.85)'
              : 'transparent',
            backdropFilter: scrolled ? 'blur(16px)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
            borderBottom: scrolled
              ? '1px solid rgba(255,255,255,0.06)'
              : '1px solid transparent',
          }}
        >
          <div className="container-site flex h-16 items-center justify-between md:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="text-xl font-bold tracking-[0.1em]"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text-primary)',
              }}
            >
              FOREST
            </Link>

            {/* Desktop Links */}
            <ul className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm uppercase tracking-[0.1em] transition-colors duration-200 hover:text-[var(--color-accent)]"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Mobile Hamburger */}
            <button
              type="button"
              className="relative flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Zamknij menu' : 'Otwórz menu'}
            >
              <motion.span
                className="block h-px w-6"
                style={{ backgroundColor: 'var(--color-text-primary)' }}
                animate={{
                  rotate: mobileOpen ? 45 : 0,
                  y: mobileOpen ? 4 : 0,
                }}
                transition={{ duration: 0.25 }}
              />
              <motion.span
                className="block h-px w-6"
                style={{ backgroundColor: 'var(--color-text-primary)' }}
                animate={{ opacity: mobileOpen ? 0 : 1 }}
                transition={{ duration: 0.15 }}
              />
              <motion.span
                className="block h-px w-6"
                style={{ backgroundColor: 'var(--color-text-primary)' }}
                animate={{
                  rotate: mobileOpen ? -45 : 0,
                  y: mobileOpen ? -4 : 0,
                }}
                transition={{ duration: 0.25 }}
              />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[calc(var(--z-header)-1)] flex flex-col items-center justify-center gap-8"
            style={{ backgroundColor: 'var(--color-bg-primary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                className="text-2xl font-semibold uppercase tracking-[0.1em]"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-text-primary)',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
