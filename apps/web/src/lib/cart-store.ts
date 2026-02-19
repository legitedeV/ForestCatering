'use client'
// Full implementation in Part 2B. This stub prevents import errors.
import { create } from 'zustand'

interface CartItem {
  productId: string; name: string; slug: string;
  price: number; quantity: number; image?: string;
}
interface CartStore {
  items: CartItem[];
  itemCount: number;
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  subtotal: number; deliveryFee: number; total: number;
}
export const useCart = create<CartStore>()((_set, _get) => ({
  items: [],
  itemCount: 0,
  subtotal: 0,
  deliveryFee: 0,
  total: 0,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
}))
