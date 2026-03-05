import type { Metadata } from 'next';
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google';

import '@/app/globals.css';
import LenisProvider from '@/components/scroll/LenisProvider';
import GrainOverlay from '@/components/ui/GrainOverlay';
import CustomCursor from '@/components/ui/CustomCursor';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

const playfair = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

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
    <html
      lang="pl"
      className={`${playfair.variable} ${inter.variable} ${jetbrains.variable}`}
    >
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
