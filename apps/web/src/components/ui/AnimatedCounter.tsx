'use client'
import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useTransform, animate, motion } from 'framer-motion'

export function AnimatedCounter({ value, suffix = '', label }: {
  value: number; suffix?: string; label: string;
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))
  const display = useTransform(rounded, (v) => `${v}${suffix}`)

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, { duration: 2, ease: 'easeOut' })
      return controls.stop
    }
  }, [isInView, count, value])

  return (
    <div ref={ref} className="text-center">
      <motion.span className="block text-4xl font-bold text-accent md:text-5xl">
        {display}
      </motion.span>
      <span className="mt-2 block text-sm text-forest-200 md:text-base">{label}</span>
    </div>
  )
}
