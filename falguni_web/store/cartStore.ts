'use client';
import { create } from 'zustand';
import type { CartItem } from '@/types';
import { DeliveryDetails } from '@/components/ui/DeliveryAddressInput';

export function parseWeightToKg(unitString: string): number {
  if (!unitString) return 1.0;
  const str = unitString.toLowerCase();
  const match = str.match(/([0-9.]+)\s*(kg|gm|g|ltr|ml)/);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2];
    if (unit === 'kg' || unit === 'ltr') return value;
    if (unit === 'gm' || unit === 'g' || unit === 'ml') return value / 1000;
  }
  return 1.0; // default to 1kg if unparseable
}

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
    
    const d = details.distanceKm;
    const cartSubTotal = get().subTotal(); // Use Subtotal before discounts!
    
    if (d <= 5) return cartSubTotal >= 400 ? 0 : 50;
    if (d <= 10) return cartSubTotal >= 1200 ? 0 : 100;
    if (d <= 15) return cartSubTotal >= 1800 ? 0 : 150;
    
    // Weight-based logic for >15km
    const weight = get().totalWeightKg();
    const isGujarat = details.address.toLowerCase().includes('gujarat');
    
    if (isGujarat) {
      return cartSubTotal >= 2000 ? 0 : Math.ceil(weight) * 40;
    } else {
      return cartSubTotal >= 3500 ? 0 : Math.ceil(weight) * 100;
    }
  },
}));
