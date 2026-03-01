import type { Variants } from 'framer-motion'

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
}
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}
export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
}
export const slideRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
}
export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
}
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
}

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}
export const slideLeftBounce: Variants = {
  hidden: { opacity: 0, x: -80 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } },
}
export const slideRightBounce: Variants = {
  hidden: { opacity: 0, x: 80 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } },
}
export const scaleElastic: Variants = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 15 } },
}
export const rotateIn: Variants = {
  hidden: { opacity: 0, rotate: -8, scale: 0.9 },
  visible: { opacity: 1, rotate: 0, scale: 1, transition: { duration: 0.7 } },
}
export const blurIn: Variants = {
  hidden: { opacity: 0, filter: 'blur(12px)', scale: 1.02 },
  visible: { opacity: 1, filter: 'blur(0px)', scale: 1, transition: { duration: 0.8 } },
}
export const flipY: Variants = {
  hidden: { opacity: 0, rotateY: 30 },
  visible: { opacity: 1, rotateY: 0, transition: { duration: 0.8 } },
}
export const flipX: Variants = {
  hidden: { opacity: 0, rotateX: 20 },
  visible: { opacity: 1, rotateX: 0, transition: { duration: 0.8 } },
}
export const bounceIn: Variants = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 12 } },
}
export const staggerCascade: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}
export const cascadeItem: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 14 } },
}
export const fadeUpSlow: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.25, 0.46, 0.45, 0.94] } },
}
export const zoomOut: Variants = {
  hidden: { opacity: 0, scale: 1.15 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: 'easeOut' } },
}
