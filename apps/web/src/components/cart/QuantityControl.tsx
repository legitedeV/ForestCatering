'use client'

interface QuantityControlProps {
  quantity: number
  onChange: (qty: number) => void
  compact?: boolean
}

export function QuantityControl({ quantity, onChange, compact = false }: QuantityControlProps) {
  const btnClass = compact
    ? 'flex h-7 w-7 items-center justify-center rounded text-sm'
    : 'flex h-9 w-9 items-center justify-center rounded-lg text-base'

  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-forest-700">
      <button
        onClick={() => onChange(quantity - 1)}
        disabled={quantity <= 1}
        className={`${btnClass} text-cream transition hover:bg-forest-600 disabled:text-forest-500 disabled:hover:bg-transparent`}
        aria-label="Zmniejsz ilość"
      >
        −
      </button>
      <span className={`${compact ? 'w-7 text-sm' : 'w-10 text-base'} text-center font-semibold text-cream`}>
        {quantity}
      </span>
      <button
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= 99}
        className={`${btnClass} text-cream transition hover:bg-forest-600 disabled:text-forest-500 disabled:hover:bg-transparent`}
        aria-label="Zwiększ ilość"
      >
        +
      </button>
    </div>
  )
}
