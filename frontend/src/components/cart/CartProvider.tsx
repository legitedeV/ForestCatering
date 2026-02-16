'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'fc_cart_items';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as unknown;
        if (Array.isArray(parsed)) {
          setItems(
            parsed.filter(
              (item): item is CartItem =>
                typeof item === 'object' &&
                item !== null &&
                'id' in item &&
                'name' in item &&
                'quantity' in item &&
                'price' in item
            )
          );
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((current) => current.id === item.id);
      if (!existing) {
        return [...prev, item];
      }
      return prev.map((current) =>
        current.id === item.id ? { ...current, quantity: current.quantity + item.quantity } : current
      );
    });
  };

  const value = useMemo(() => ({ items, addItem }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
};
