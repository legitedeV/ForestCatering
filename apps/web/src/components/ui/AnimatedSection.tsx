'use client'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/animations'

export function AnimatedSection({ children, className, stagger = false }: {
  children: React.ReactNode; className?: string; stagger?: boolean;
}) {
  return (
    <motion.section
      variants={stagger ? staggerContainer : fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className={className}
    >{children}</motion.section>
  )
}

export function AnimatedItem({ children, className }: {
  children: React.ReactNode; className?: string;
}) {
  return <motion.div variants={fadeUp} className={className}>{children}</motion.div>
}
