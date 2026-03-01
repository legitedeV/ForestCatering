import type { Metadata } from 'next'
import '@fontsource-variable/inter'
import './globals.css'

const NO_INDEX = process.env.NO_INDEX === 'true'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Forest Catering — Profesjonalny catering w Szczecinie',
  description:
    'Forest Catering to profesjonalna firma cateringowa ze Szczecina. Oferujemy catering firmowy, weselny, eventowy i usługi barowe.',
  ...(NO_INDEX ? { robots: { index: false, follow: false } } : {}),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="bg-forest-900 font-sans text-warmwhite antialiased">
        {children}
      </body>
    </html>
  )
}
