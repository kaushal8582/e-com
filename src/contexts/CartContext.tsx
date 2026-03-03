'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Cart, CartItem, Product } from '@/types';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';

const GUEST_CART_KEY = 'guest_cart';

interface GuestCartItem {
  productId: string;
  qty: number;
}

interface CartContextType {
  cart: Cart | null;
  guestItems: GuestCartItem[];
  addItem: (productId: string, qty: number, product?: Product) => Promise<void>;
  updateQty: (productId: string, qty: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  syncGuestCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

function getGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const s = localStorage.getItem(GUEST_CART_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function setGuestCart(items: GuestCartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [guestItems, setGuestItems] = useState<GuestCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!token) {
      setCart(null);
      setGuestItems(getGuestCart());
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiGet<{ success: boolean; data: Cart }>('/cart', token);
      setCart(res.data || { items: [] });
      setGuestItems([]);
    } catch {
      setCart({ items: [] });
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setGuestItems(getGuestCart());
      setCart(null);
      return;
    }
    refreshCart();
  }, [token, refreshCart]);

  const syncGuestCart = useCallback(async () => {
    if (!token || guestItems.length === 0) return;
    const items = getGuestCart();
    if (items.length === 0) return;
    try {
      await apiPost('/cart/sync', { items }, token);
      setGuestCart([]);
      setGuestItems([]);
      await refreshCart();
    } catch {
      // ignore
    }
  }, [token, guestItems.length, refreshCart]);

  const addItem = useCallback(
    async (productId: string, qty: number, _product?: Product) => {
      if (!token) {
        throw new Error('Please log in to add to cart');
      }
      await apiPost<{ success: boolean; data: Cart }>('/cart/items', { productId, qty }, token);
      await refreshCart();
    },
    [token, refreshCart]
  );

  const updateQty = useCallback(
    async (productId: string, qty: number) => {
      if (token) {
        await apiPatch<{ success: boolean; data: Cart }>(`/cart/items/${productId}`, { qty }, token);
        await refreshCart();
      } else {
        const items = getGuestCart().filter((i) => i.productId !== productId);
        if (qty > 0) items.push({ productId, qty });
        setGuestCart(items);
        setGuestItems([...items]);
      }
    },
    [token, refreshCart]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (token) {
        await apiDelete<{ success: boolean; data: Cart }>(`/cart/items/${productId}`, token);
        await refreshCart();
      } else {
        const items = getGuestCart().filter((i) => i.productId !== productId);
        setGuestCart(items);
        setGuestItems([...items]);
      }
    },
    [token, refreshCart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        guestItems,
        addItem,
        updateQty,
        removeItem,
        syncGuestCart,
        refreshCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
