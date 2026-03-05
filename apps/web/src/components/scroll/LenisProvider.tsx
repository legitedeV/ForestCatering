'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';

interface LenisProviderProps {
  children: React.ReactNode;
}

export default function LenisProvider({ children }: LenisProviderProps) {
  const lenisRef = useRef<InstanceType<typeof import('lenis').default> | null>(
    null,
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useLenis((lenis) => {
    lenisRef.current = lenis;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);

    if (mq.matches) {
      lenisRef.current?.destroy();
      return;
    }

    // Sync Lenis scroll with GSAP ScrollTrigger
    const update = (time: number) => {
      lenisRef.current?.raf(time * 1000);
    };
    gsap.ticker.add(update);

    const onScroll = () => {
      ScrollTrigger.update();
    };

    return () => {
      gsap.ticker.remove(update);
      lenisRef.current?.off('scroll', onScroll);
    };
  }, []);

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
