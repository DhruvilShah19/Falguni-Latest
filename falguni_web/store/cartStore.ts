'use client';
import { create } from 'zustand';
import type { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  couponCode: string;
  couponDiscount: number; // percentage
  setItems: (items: CartItem[]) => void;
  setCoupon: (code: string, discount: number) => void;
  clearCoupon: () => void;
  totalQuantity: () => number;
  subTotal: () => number;
  discountedTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  couponCode: '',
  couponDiscount: 0,

  setItems: (items) => set({ items }),

  setCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),

  clearCoupon: () => set({ couponCode: '', couponDiscount: 0 }),

  totalQuantity: () =>
    get().items.reduce((sum, item) => sum + (item.quantity ?? 1), 0),

  subTotal: () =>
    get().items.reduce((sum, item) => sum + (item.price ?? 0), 0),

  discountedTotal: () => {
    const sub = get().subTotal();
    const disc = get().couponDiscount;
    return disc > 0 ? sub - (disc * sub) / 100 : sub;
  },
}));
