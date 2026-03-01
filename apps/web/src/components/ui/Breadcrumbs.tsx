import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="mb-8 flex items-center gap-2 text-sm text-forest-400">
      <Link href="/" className="transition hover:text-accent-warm">
        Home
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <span>›</span>
          {item.href ? (
            <Link href={item.href} className="transition hover:text-accent-warm">
              {item.label}
            </Link>
          ) : (
            <span className="text-forest-200">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
