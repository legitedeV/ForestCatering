import type { Metadata } from 'next'
import '@fontsource-variable/inter'
import './globals.css'

export const metadata: Metadata = {
  title: 'Forest Catering — Profesjonalny catering w Szczecinie',
  description:
    'Forest Catering to profesjonalna firma cateringowa ze Szczecina. Oferujemy catering firmowy, weselny, eventowy i usługi barowe.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="bg-warmwhite font-sans text-forest-900 antialiased">
        {children}
      </body>
    </html>
  )
}
