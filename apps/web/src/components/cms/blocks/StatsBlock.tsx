import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import type { PageSection } from '../types'

type StatsProps = Extract<PageSection, { blockType: 'stats' }>

export function StatsBlock({ items }: StatsProps) {
  if (!items || items.length === 0) return null

  return (
    <section className="bg-transparent py-6">
      <div className="floating-stats mx-auto max-w-5xl px-8 py-8">
        <div className="flex flex-wrap items-center justify-center gap-8">
          {items.map((item, i) => (
            <div key={item.id ?? i} className="flex items-center gap-8">
              <AnimatedCounter
                value={item.value}
                suffix={item.suffix ?? ''}
                label={item.label}
              />
              {i < items.length - 1 && (
                <div className="hidden h-12 w-px bg-forest-600/30 md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
