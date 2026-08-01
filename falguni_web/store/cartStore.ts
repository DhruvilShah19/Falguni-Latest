'use client';
import { create } from 'zustand';
import type { CartItem } from '@/types';
import { DeliveryDetails, calculateDeliveryFee, parseWeightToKg } from '@/lib/deliveryPricing';

// Re-exported for backward compatibility with any existing imports of
// parseWeightToKg from this file -- canonical definition now lives in
// @/lib/deliveryPricing alongside the rest of the delivery pricing logic.
export { parseWeightToKg };

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
  totalWeightKg: () => number;
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

  totalWeightKg: () => {
    return get().items.reduce((sum, item) => {
      const qty = item.quantity ?? 1;
      const w = parseWeightToKg(item.selected || item.unitname1 || '');
      return sum + (w * qty);
    }, 0);
  },

  deliveryFee: () => {
    if (get().isPickup) return 0;
    const details = get().deliveryDetails;
    if (!details) return 0;

    const cartSubTotal = get().subTotal(); // Use Subtotal before discounts!
    const weight = get().totalWeightKg();
    return calculateDeliveryFee(details.distanceKm, details.address, cartSubTotal, weight).fee;
  },
}));
