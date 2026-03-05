'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';

const ForestScene = dynamic(
  () => import('@/components/canvas/ForestScene').then((mod) => mod.default),
  { ssr: false },
);

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const textOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.35], [0, -120]);
  const sceneProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ minHeight: '300vh' }}
    >
      {/* Three.js Forest Background */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <motion.div className="absolute inset-0">
          <ForestScene scrollProgress={sceneProgress.get()} />
        </motion.div>

        {/* Overlay Text */}
        <motion.div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center"
          style={{ opacity: textOpacity, y: textY }}
        >
          <motion.h1
            className="text-gradient text-center"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(4rem, 15vw, 12rem)',
              fontWeight: 700,
              lineHeight: 0.9,
              letterSpacing: '-0.02em',
            }}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            FOREST
          </motion.h1>

          <motion.p
            className="mt-6 text-center tracking-[0.3em] uppercase"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-secondary)',
              fontSize: 'clamp(0.75rem, 1.5vw, 1.125rem)',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            Catering &amp; Bar — Szczecin
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-12 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <span
              className="text-xs uppercase tracking-[0.2em]"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Scroll
            </span>
            <motion.div
              className="h-12 w-px"
              style={{ backgroundColor: 'var(--color-accent)' }}
              animate={{ scaleY: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
