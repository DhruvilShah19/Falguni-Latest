'use client';
import { create } from 'zustand';
import type { CartItem } from '@/types';
import { DeliveryDetails } from '@/components/ui/DeliveryAddressInput';

interface CartState {
  items: CartItem[];
  couponCode: string;
  couponDiscount: number; // percentage
  isPickup: boolean;
  deliveryDetails: DeliveryDetails | null;
  setItems: (items: CartItem[]) => void;
  setCoupon: (code: string, discount: number) => void;
  clearCoupon: () => void;
  setFulfillment: (isPickup: boolean, details: DeliveryDetails | null) => void;
  totalQuantity: () => number;
  subTotal: () => number;
  discountedTotal: () => number;
  deliveryFee: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  couponCode: '',
  couponDiscount: 0,
  isPickup: false,
  deliveryDetails: null,

  setItems: (items) => set({ items }),

  setCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),

  clearCoupon: () => set({ couponCode: '', couponDiscount: 0 }),
  
  setFulfillment: (isPickup, details) => set({ isPickup, deliveryDetails: details }),

  totalQuantity: () =>
    get().items.reduce((sum, item) => sum + (item.quantity ?? 1), 0),

  subTotal: () =>
    get().items.reduce((sum, item) => sum + (item.price ?? 0), 0),

  discountedTotal: () => {
    const sub = get().subTotal();
    const disc = get().couponDiscount;
    return disc > 0 ? sub - (disc * sub) / 100 : sub;
  },

  deliveryFee: () => {
    if (get().isPickup) return 0;
    const details = get().deliveryDetails;
    if (!details) return 0;
    
    const d = details.distanceKm;
    const cartSubTotal = get().subTotal(); // Use Subtotal before discounts!
    
    if (d <= 15) return cartSubTotal >= 100 ? 0 : 10;
    if (d <= 50) return cartSubTotal >= 500 ? 0 : 25;
    if (d <= 500) return cartSubTotal >= 2000 ? 0 : 100;
    return cartSubTotal >= 5000 ? 0 : 150;
  },
}));
