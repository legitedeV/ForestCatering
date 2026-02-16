'use client';

import Link from 'next/link';

import { CartIcon } from '@/components/cart/CartIcon';
import { useBrand } from '@/components/layout/BrandProvider';

export const Header = () => {
  const { mode, setMode } = useBrand();

  return (
    <header className="sticky top-0 z-50 border-b border-fc-accent/30 bg-fc-bgElev/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-fc-accent to-fc-accent2 font-bold text-black">
            FC
          </span>
          <span className="font-semibold">ForestCatering</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/menu">Menu</Link>
          <Link href="/eventy">Eventy</Link>
          <Link href="/koszyk">Koszyk</Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex rounded-full border border-fc-accent p-1 text-sm">
            <button
              type="button"
              aria-selected={mode === 'catering'}
              onClick={() => setMode('catering')}
              className={`rounded-full px-3 py-1 ${mode === 'catering' ? 'bg-gradient-to-br from-fc-accent to-fc-accent2 text-black' : 'text-fc-muted'}`}
            >
              Catering
            </button>
            <button
              type="button"
              aria-selected={mode === 'bar'}
              onClick={() => setMode('bar')}
              className={`rounded-full px-3 py-1 ${mode === 'bar' ? 'bg-gradient-to-br from-fc-accent to-fc-accent2 text-black' : 'text-fc-muted'}`}
            >
              Bar
            </button>
          </div>
          <CartIcon />
        </div>
      </div>
    </header>
  );
};
