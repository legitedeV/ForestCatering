import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import type { PageSection } from '../types'

type StatsProps = Extract<PageSection, { blockType: 'stats' }>

export function StatsBlock({ items }: StatsProps) {
  if (!items || items.length === 0) return null

  return (
    <section className="bg-forest-900 py-20">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 md:grid-cols-4">
        {items.map((item, i) => (
          <AnimatedCounter
            key={item.id ?? i}
            value={item.value}
            suffix={item.suffix ?? ''}
            label={item.label}
          />
        ))}
      </div>
    </section>
  )
}
