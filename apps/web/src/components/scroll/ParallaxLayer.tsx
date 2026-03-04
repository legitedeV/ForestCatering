'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { useGsap } from '@/hooks/useGsap';

interface ParallaxLayerProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export default function ParallaxLayer({
  children,
  speed = 0.5,
  className,
}: ParallaxLayerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useGsap(() => {
    if (!wrapperRef.current || !innerRef.current) return;

    const distance = (1 - speed) * 100;

    gsap.to(innerRef.current, {
      yPercent: -distance,
      ease: 'none',
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, [speed], wrapperRef);

  return (
    <div ref={wrapperRef} className={className} style={{ overflow: 'hidden' }}>
      <div ref={innerRef} style={{ willChange: 'transform' }}>
        {children}
      </div>
    </div>
  );
}
