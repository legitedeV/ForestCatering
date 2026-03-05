'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

type CursorType = 'default' | 'pointer' | 'text' | 'hidden';

const SPRING_CONFIG = { damping: 25, stiffness: 300, mass: 0.5 };

export default function CustomCursor() {
  const [cursorType, setCursorType] = useState<CursorType>('default');
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const dotRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const ringX = useSpring(mouseX, SPRING_CONFIG);
  const ringY = useSpring(mouseY, SPRING_CONFIG);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_CUSTOM_CURSOR === 'false') return;

    const checkMobile = () => {
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      const narrow = window.innerWidth < 768;
      setIsMobile(coarse || narrow);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    if (process.env.NEXT_PUBLIC_ENABLE_CUSTOM_CURSOR === 'false') return;

    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);

    const onPointerOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const cursorAttr = target.closest<HTMLElement>('[data-cursor]');

      if (cursorAttr) {
        setCursorType(cursorAttr.dataset.cursor as CursorType);
        return;
      }

      const interactive = target.closest('a, button, [role="button"], input, textarea, select');
      if (interactive) {
        setCursorType('pointer');
        return;
      }

      setCursorType('default');
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('pointerover', onPointerOver);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('pointerover', onPointerOver);
    };
  }, [isMobile, isVisible, mouseX, mouseY]);

  if (
    isMobile ||
    process.env.NEXT_PUBLIC_ENABLE_CUSTOM_CURSOR === 'false'
  ) {
    return null;
  }

  const isPointer = cursorType === 'pointer';
  const ringSize = isPointer ? 48 : 32;
  const dotSize = isPointer ? 6 : 4;

  return (
    <>
      {/* Dot */}
      <motion.div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: mouseX,
          y: mouseY,
          pointerEvents: 'none',
          zIndex: 10000,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: dotSize,
          height: dotSize,
          opacity: isVisible && cursorType !== 'hidden' ? 1 : 0,
        }}
        transition={{ duration: 0.15 }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: 'var(--cursor-color, #1a1a1a)',
          }}
        />
      </motion.div>

      {/* Ring */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: ringX,
          y: ringY,
          pointerEvents: 'none',
          zIndex: 9999,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: ringSize,
          height: ringSize,
          opacity: isVisible && cursorType !== 'hidden' ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '1.5px solid var(--cursor-color, #1a1a1a)',
            opacity: 0.5,
          }}
        />
      </motion.div>
    </>
  );
}
