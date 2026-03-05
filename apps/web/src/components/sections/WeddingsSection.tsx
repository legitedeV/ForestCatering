'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import MagneticButton from '@/components/ui/MagneticButton';

export default function WeddingsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <section
      id="wesela"
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Background — video placeholder / dark gradient */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{ y: bgY }}
      >
        <div
          className="h-[120%] w-full"
          style={{
            background:
              'linear-gradient(180deg, #0D1F15 0%, #1A2F22 40%, #0D1F15 100%)',
          }}
        />
      </motion.div>

      {/* Bottom gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'linear-gradient(to top, var(--color-bg-primary) 0%, transparent 40%)',
        }}
      />

      {/* Content */}
      <div className="container-site relative z-10 py-32 text-center">
        <motion.h2
          className="text-gradient mx-auto max-w-4xl"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
            fontWeight: 700,
            lineHeight: 1.05,
          }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-100px' }}
        >
          Twoje wymarzone wesele
        </motion.h2>

        <motion.p
          className="mx-auto mt-8 max-w-xl text-lg leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-100px' }}
        >
          Organizujemy wesela, które goście zapamiętają na lata. Leśna
          atmosfera, wyjątkowe menu i perfekcyjna obsługa — to nasz standard.
        </motion.p>

        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <MagneticButton
            href="/wesela"
            className="inline-flex items-center gap-2 rounded-full border px-8 py-4 text-sm font-medium uppercase tracking-[0.15em] transition-colors border-[var(--color-accent)] text-[var(--color-accent)]"
          >
            Zapytaj o termin
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
