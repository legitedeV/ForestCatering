'use client';

import { useRef, type ReactNode } from 'react';
import { ScrollTrigger } from '@/lib/gsap-init';
import { useGsap } from '@/hooks/useGsap';

interface ScrollSectionProps {
  id?: string;
  className?: string;
  children: ReactNode;
  onEnter?: () => void;
  onLeave?: () => void;
  markers?: boolean;
}

export default function ScrollSection({
  id,
  className,
  children,
  onEnter,
  onLeave,
  markers = false,
}: ScrollSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGsap(() => {
    if (!sectionRef.current) return;

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 80%',
      end: 'bottom 20%',
      markers,
      onEnter: () => onEnter?.(),
      onLeave: () => onLeave?.(),
      onEnterBack: () => onEnter?.(),
      onLeaveBack: () => onLeave?.(),
    });
  }, [onEnter, onLeave, markers], sectionRef);

  return (
    <section ref={sectionRef} id={id} className={className}>
      {children}
    </section>
  );
}
