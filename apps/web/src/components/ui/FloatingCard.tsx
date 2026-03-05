'use client';

import { useRef, useState, type ReactNode, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface FloatingCardProps {
  children: ReactNode;
  className?: string;
}

const SPRING_CONFIG = { damping: 20, stiffness: 200, mass: 0.5 };
const MAX_ROTATION = 15;

export default function FloatingCard({ children, className }: FloatingCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springRotateX = useSpring(rotateX, SPRING_CONFIG);
  const springRotateY = useSpring(rotateY, SPRING_CONFIG);

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    rotateX.set(-y * MAX_ROTATION);
    rotateY.set(x * MAX_ROTATION);
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    setIsHovered(false);
  };

  return (
    <div style={{ perspective: 800 }}>
      <motion.div
        ref={ref}
        className={className}
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: 'preserve-3d',
          boxShadow: isHovered
            ? '0 20px 40px rgba(0, 0, 0, 0.25)'
            : '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'box-shadow 0.3s ease',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </motion.div>
    </div>
  );
}
