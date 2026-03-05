'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const stats: Stat[] = [
  { value: 500, suffix: '+', label: 'wesel' },
  { value: 12, suffix: '', label: 'lat doświadczenia' },
  { value: 50, suffix: 'km', label: 'zasięg' },
  { value: 100, suffix: '%', label: 'pasji' },
];

export default function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const gradientOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-32">
      {/* Animated background gradient */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          opacity: gradientOpacity,
          background:
            'radial-gradient(ellipse at center, rgba(45,90,61,0.25) 0%, transparent 70%)',
        }}
      />

      <div className="container-site">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center gap-2 text-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: '-50px' }}
            >
              <span
                className="text-gradient block"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  duration={2}
                />
              </span>
              <span
                className="text-sm uppercase tracking-[0.15em]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
