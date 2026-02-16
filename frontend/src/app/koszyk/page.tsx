'use client';

import { useMemo } from 'react';

import { EmptyState } from '@/components/ui/EmptyState';
import { useCart } from '@/components/cart/CartProvider';

export default function CartPage() {
  const { items } = useCart();

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Koszyk</h1>
      {!items.length ? (
        <EmptyState title="Koszyk jest pusty" description="Dodaj produkty z sekcji Menu lub Eventy." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-xl border border-fc-accent/25 bg-fc-surface p-4">
              <h2 className="font-semibold">{item.name}</h2>
              <p className="text-fc-muted">Ilość: {item.quantity}</p>
              <p className="text-fc-accent">{(item.price * item.quantity).toFixed(2)} PLN</p>
            </article>
          ))}
          <p className="text-lg font-semibold">Razem: {total.toFixed(2)} PLN</p>
        </div>
      )}
    </div>
  );
}
