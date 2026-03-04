'use client';

import { useRef, useMemo } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { useGsap } from '@/hooks/useGsap';

interface TextRevealProps {
  children: string;
  className?: string;
  mode?: 'word' | 'char';
  stagger?: number;
}

export default function TextReveal({
  children,
  className,
  mode = 'word',
  stagger = 0.05,
}: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const tokens = useMemo(() => {
    if (mode === 'char') return children.split('');
    return children.split(/(\s+)/);
  }, [children, mode]);

  useGsap(() => {
    if (!containerRef.current) return;

    const elements = containerRef.current.querySelectorAll('.reveal-token');
    if (elements.length === 0) return;

    gsap.set(elements, { opacity: 0, y: 20 });

    gsap.to(elements, {
      opacity: 1,
      y: 0,
      stagger,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 85%',
        end: 'bottom 60%',
        scrub: 1,
      },
    });
  }, [stagger, mode, children], containerRef);

  return (
    <div ref={containerRef} className={className} aria-label={children}>
      {tokens.map((token, i) => {
        if (mode === 'word' && /^\s+$/.test(token)) {
          return <span key={i}>&nbsp;</span>;
        }

        return (
          <span
            key={i}
            className="reveal-token"
            style={{ display: 'inline-block', willChange: 'transform, opacity' }}
            aria-hidden="true"
          >
            {mode === 'char' && token === ' ' ? '\u00A0' : token}
          </span>
        );
      })}
    </div>
  );
}
