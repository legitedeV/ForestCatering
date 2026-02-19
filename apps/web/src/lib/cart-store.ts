'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  name: string
  slug: string
  price: number       // grosze
  quantity: number
  image?: string      // URL
}

interface CartState {
  items: CartItem[]
  isDrawerOpen: boolean

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleDrawer: () => void
  openDrawer: () => void
  closeDrawer: () => void
}

// Constants
const DELIVERY_FEE = 1500          // 15.00 PLN in grosze
const FREE_DELIVERY_THRESHOLD = 15000  // 150.00 PLN
const MIN_ORDER_AMOUNT = 5000      // 50.00 PLN

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (item, qty = 1) => set(state => {
        const existing = state.items.find(i => i.productId === item.productId)
        if (existing) {
          return {
            items: state.items.map(i =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + qty }
                : i
            ),
            isDrawerOpen: true,
          }
        }
        return {
          items: [...state.items, { ...item, quantity: qty }],
          isDrawerOpen: true,
        }
      }),

      removeItem: (productId) => set(state => ({
        items: state.items.filter(i => i.productId !== productId),
      })),

      updateQuantity: (productId, quantity) => set(state => {
        if (quantity <= 0) return { items: state.items.filter(i => i.productId !== productId) }
        return {
          items: state.items.map(i =>
            i.productId === productId ? { ...i, quantity: Math.min(quantity, 99) } : i
          ),
        }
      }),

      clearCart: () => set({ items: [] }),
      toggleDrawer: () => set(state => ({ isDrawerOpen: !state.isDrawerOpen })),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
    }),
    { name: 'fc-cart' }
  )
)

// Selector hooks (computed values)
export const useCartItemCount = () => useCart(s => s.items.reduce((sum, i) => sum + i.quantity, 0))
export const useCartSubtotal = () => useCart(s => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0))
export const useCartDeliveryFee = () => {
  const subtotal = useCartSubtotal()
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
}
export const useCartTotal = () => {
  const subtotal = useCartSubtotal()
  const fee = useCartDeliveryFee()
  return subtotal + fee
}
export const useCanCheckout = () => {
  const subtotal = useCartSubtotal()
  const count = useCartItemCount()
  return count > 0 && subtotal >= MIN_ORDER_AMOUNT
}

export { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, MIN_ORDER_AMOUNT }
