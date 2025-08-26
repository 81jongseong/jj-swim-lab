'use client';

import { useEffect, useState } from 'react';

export interface CartItem { productId: string; name: string; price: number; qty: number }

const STORAGE_KEY = 'shop.cart.v1';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { setItems(JSON.parse(raw)); } catch { setItems([]); }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = (p: { productId: string; name: string; price: number }, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.productId === p.productId);
      if (idx === -1) return [...prev, { ...p, qty }];
      const copy = [...prev];
      copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
      return copy;
    });
  };

  const remove = (productId: string) => setItems(prev => prev.filter(i => i.productId !== productId));
  const clear = () => setItems([]);
  const setQty = (productId: string, qty: number) => setItems(prev => prev.map(i => i.productId === productId ? { ...i, qty: Math.max(1, qty) } : i));
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return { items, add, remove, clear, setQty, total };
}





































