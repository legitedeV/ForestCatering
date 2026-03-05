'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { useGsap } from '@/hooks/useGsap';

interface ColorTransitionProps {
  children: ReactNode;
  fromColor: string;
  toColor: string;
  className?: string;
}

export default function ColorTransition({
  children,
  fromColor,
  toColor,
  className,
}: ColorTransitionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGsap(() => {
    if (!sectionRef.current) return;

    gsap.fromTo(
      sectionRef.current,
      { backgroundColor: fromColor },
      {
        backgroundColor: toColor,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    );
  }, [fromColor, toColor], sectionRef);

  return (
    <section ref={sectionRef} className={className} style={{ backgroundColor: fromColor }}>
      {children}
    </section>
  );
}
