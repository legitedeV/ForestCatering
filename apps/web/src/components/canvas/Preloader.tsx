'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
  isLoading: boolean;
  /** 0 – 100 */
  progress?: number;
}

export default function Preloader({ isLoading, progress = 0 }: PreloaderProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0A0A0A',
          }}
        >
          {/* SVG "FOREST" text with animated stroke */}
          <svg
            viewBox="0 0 400 80"
            width={400}
            height={80}
            aria-label="Loading Forest"
          >
            <text
              x="50%"
              y="50%"
              dominantBaseline="central"
              textAnchor="middle"
              fill="none"
              stroke="#C8A862"
              strokeWidth={1.2}
              fontSize={56}
              fontFamily="serif"
            >
              <motion.tspan
                initial={{ strokeDasharray: 600, strokeDashoffset: 600 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 2.4, ease: 'easeInOut' }}
              >
                FOREST
              </motion.tspan>
            </text>
          </svg>

          {/* Progress bar */}
          <div
            style={{
              position: 'absolute',
              bottom: 48,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 200,
              height: 2,
              background: 'rgba(200,168,98,0.2)',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <motion.div
              style={{
                height: '100%',
                background: '#C8A862',
                borderRadius: 1,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.4 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
