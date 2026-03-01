import type { Metadata } from 'next'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'Edytor stron — Forest Catering',
}

/** Dedykowany layout edytora — bez Navbar, Footer, CartDrawer */
export default function PageEditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-forest-950 text-cream">
        {children}
      </div>
    </ToastProvider>
  )
}
