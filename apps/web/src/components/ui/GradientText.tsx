'use client';

import { useRef, type ReactNode, type ElementType } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { useGsap } from '@/hooks/useGsap';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

export default function GradientText({
  children,
  className,
  as: Tag = 'span',
}: GradientTextProps) {
  const ref = useRef<HTMLElement>(null);

  useGsap(() => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      { backgroundPosition: '0% 50%' },
      {
        backgroundPosition: '100% 50%',
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 90%',
          end: 'bottom 60%',
          scrub: 1,
        },
      },
    );
  }, [], ref as React.RefObject<HTMLElement>);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        background:
          'linear-gradient(90deg, var(--color-text-accent, #C8A862), var(--color-forest-green, #2D5A3D), var(--color-text-accent, #C8A862))',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'inline-block',
      }}
    >
      {children}
    </Tag>
  );
}
