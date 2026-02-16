'use client';

import Link from 'next/link';

import { useCart } from '@/components/cart/CartProvider';

export const CartIcon = () => {
  const { items } = useCart();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Link href="/koszyk" className="relative rounded-full border border-fc-accent/40 px-3 py-2 text-sm">
      Koszyk
      <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-fc-accent px-1 text-xs font-bold text-black">
        {itemCount}
      </span>
    </Link>
  );
};
