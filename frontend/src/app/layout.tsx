import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import '@/app/globals.css';
import { CartProvider } from '@/components/cart/CartProvider';
import { Footer } from '@/components/layout/Footer';
import { BrandProvider } from '@/components/layout/BrandProvider';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'ForestCatering',
  description: 'Headless frontend dla ForestCatering'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pl" data-brand="catering">
      <body className="min-h-screen font-sans">
        <BrandProvider>
          <CartProvider>
            <Header />
            <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
            <Footer />
          </CartProvider>
        </BrandProvider>
      </body>
    </html>
  );
}
