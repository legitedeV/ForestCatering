'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { useGsap } from '@/hooks/useGsap';

interface PinnedSectionProps {
  children: ReactNode;
  className?: string;
  pinDuration?: number;
  onProgress?: (progress: number) => void;
}

export default function PinnedSection({
  children,
  className,
  pinDuration = 1,
  onProgress,
}: PinnedSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGsap(() => {
    if (!sectionRef.current || !contentRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: `+=${window.innerHeight * pinDuration}`,
        pin: true,
        scrub: true,
        onUpdate: (self) => onProgress?.(self.progress),
      },
    });

    tl.fromTo(
      contentRef.current,
      { opacity: 0.6 },
      { opacity: 1, duration: 1 },
    );

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [pinDuration, onProgress], sectionRef);

  return (
    <section ref={sectionRef} className={className}>
      <div ref={contentRef}>{children}</div>
    </section>
  );
}
