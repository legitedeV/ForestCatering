'use client';

import { useEffect, useRef, type DependencyList } from 'react';
import { gsap } from '@/lib/gsap-init';

export function useGsap(
  callback: (ctx: gsap.Context) => void,
  deps: DependencyList = [],
  scope?: React.RefObject<HTMLElement | null>,
): void {
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const ctx = gsap.context((self) => {
      callback(self);
    }, scope?.current ?? undefined);

    ctxRef.current = ctx;

    return () => {
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
