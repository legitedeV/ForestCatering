import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { ToastProvider } from '@/components/ui/Toast'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <Navbar />
      <CartDrawer />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </ToastProvider>
  )
}
