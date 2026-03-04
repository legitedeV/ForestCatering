'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import { useGsap } from '@/hooks/useGsap';

interface RevealImageProps {
  src: string;
  alt: string;
  className?: string;
  revealType?: 'circle' | 'rect';
}

export default function RevealImage({
  src,
  alt,
  className,
  revealType = 'circle',
}: RevealImageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useGsap(() => {
    if (!wrapperRef.current || !imgRef.current) return;

    const from =
      revealType === 'circle'
        ? 'circle(0% at 50% 50%)'
        : 'inset(50% 50% 50% 50%)';

    const to =
      revealType === 'circle'
        ? 'circle(100% at 50% 50%)'
        : 'inset(0% 0% 0% 0%)';

    gsap.fromTo(
      imgRef.current,
      { clipPath: from },
      {
        clipPath: to,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top 80%',
          end: 'bottom 60%',
          scrub: 1,
        },
      },
    );
  }, [revealType], wrapperRef);

  return (
    <div ref={wrapperRef} className={className} style={{ overflow: 'hidden' }}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          willChange: 'clip-path',
        }}
      />
    </div>
  );
}
