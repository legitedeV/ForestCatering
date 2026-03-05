import type { Metadata } from 'next';

import '@/app/globals.css';
import LenisProvider from '@/components/scroll/LenisProvider';
import GrainOverlay from '@/components/ui/GrainOverlay';
import CustomCursor from '@/components/ui/CustomCursor';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

/*
 * Fonts are loaded via CSS (see styles/typography.css).
 * When self-hosted woff2 files are added to public/fonts/,
 * switch to next/font/local for optimal loading.
 */

export const metadata: Metadata = {
  title: 'Forest Hub — Catering & Bar Szczecin',
  description:
    'Forest Hub to zespół pasjonatów gastronomii i eventów ze Szczecina. Wesela, catering, bar mobilny, eventy firmowe i przyjęcia rodzinne.',
  keywords: [
    'catering Szczecin',
    'bar mobilny',
    'wesela Szczecin',
    'eventy',
    'Forest Hub',
  ],
  openGraph: {
    title: 'Forest Hub — Catering & Bar Szczecin',
    description:
      'Tworzymy niezapomniane doświadczenia kulinarne. Wesela, eventy, catering dzienny i bar mobilny.',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body>
        <LenisProvider>
          <GrainOverlay />
          <CustomCursor />
          <Navigation />
          <main>{children}</main>
          <Footer />
        </LenisProvider>
      </body>
    </html>
  );
}
