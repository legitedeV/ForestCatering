import Link from 'next/link';

import type { PSProduct } from '@/lib/prestashop/types';

interface ProductCardProps {
  product: PSProduct;
  businessType: 'retail' | 'event' | null;
}

const getName = (value: PSProduct['name']) => (typeof value === 'string' ? value : value[0]?.value ?? 'Produkt');

export const ProductCard = ({ product, businessType }: ProductCardProps) => {
  const name = getName(product.name);
  const route = businessType === 'event' ? '/eventy' : '/menu';

  return (
    <article className="rounded-2xl border border-fc-accent/25 bg-fc-surface p-4">
      <div className="h-44 rounded-xl bg-gradient-to-br from-fc-accent/20 via-fc-surface to-fc-accent2/20" />
      <div className="mt-4 flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold">{name}</h3>
        <span className="rounded-full border border-fc-accent/50 px-2 py-1 text-xs uppercase text-fc-muted">
          {businessType ?? 'nieznany'}
        </span>
      </div>
      <p className="mt-2 text-fc-accent">{Number(product.price).toFixed(2)} PLN</p>
      <Link href={`${route}/${product.id}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="mt-4 inline-block rounded-full bg-fc-accent px-4 py-2 text-sm font-semibold text-black">
        Zobacz
      </Link>
    </article>
  );
};
