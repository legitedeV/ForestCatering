'use client';

import { useRef, useState, type ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { useGsap } from '@/hooks/useGsap';

interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
}

export default function HorizontalScroll({
  children,
  className,
}: HorizontalScrollProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useGsap(() => {
    if (!sectionRef.current || !trackRef.current) return;

    const track = trackRef.current;
    const scrollWidth = track.scrollWidth - track.clientWidth;

    gsap.to(track, {
      x: -scrollWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: () => `+=${scrollWidth}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => setProgress(self.progress),
      },
    });
  }, [], sectionRef);

  return (
    <section ref={sectionRef} className={className} style={{ overflow: 'hidden', position: 'relative' }}>
      <div
        ref={trackRef}
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          willChange: 'transform',
        }}
      >
        {children}
      </div>

      {/* Progress indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '3px',
          borderRadius: '2px',
          backgroundColor: 'var(--color-text-secondary, rgba(255,255,255,0.2))',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress * 100}%`,
            backgroundColor: 'var(--color-text-accent, #C8A862)',
            borderRadius: '2px',
            transition: 'width 0.1s linear',
          }}
        />
      </div>
    </section>
  );
}
