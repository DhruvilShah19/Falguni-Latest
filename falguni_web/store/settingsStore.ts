'use client';

import { create } from 'zustand';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export interface SettingsState {
  // Marketing & Loyalty
  enableCoupons: boolean;
  enableReferrals: boolean;
  referralAmount: number;

  // Store Profile
  storeName: string;
  storePhone: string;
  storeWhatsapp: string;
  storeEmail: string;
  storeAddress: string;
  storeCity: string;

  loading: boolean;
  initializeSettingsListeners: () => () => void;
}

export const useSettingsStore = create<SettingsState>((set) => {
  let unsubs: (() => void)[] = [];
  let initialized = false;

  return {
    enableCoupons: true,
    enableReferrals: true,
    referralAmount: 25,

    storeName: 'Falguni Gruh Udhyog',
    storePhone: '+91 98765 43210',
    storeWhatsapp: '+91 98765 43210',
    storeEmail: 'support@falguni.com',
    storeAddress: 'Shop No 1, Hirak Complex, Opposite Shakti Enclave, Nehru Park, Vastrapur',
    storeCity: 'Ahmedabad',

    loading: true,

    initializeSettingsListeners: () => {
      if (typeof window === 'undefined' || initialized) {
        return () => {};
      }
      initialized = true;

      try {
        // 1. Listen to Coupon System
        const unsubCoupon = onSnapshot(
          doc(db, 'Coupon System', 'Coupon System'),
          (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              set({
                enableCoupons: data?.Status !== false,
              });
            } else {
              set({ enableCoupons: true });
            }
          },
          (err) => console.warn('Coupon System listener error:', err)
        );
        unsubs.push(unsubCoupon);

        // 2. Listen to Referral System
        const unsubReferral = onSnapshot(
          doc(db, 'Referral System', 'Referral System'),
          (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              set({
                enableReferrals: data?.Status !== false,
                referralAmount: Number(data?.['Referral Amount'] ?? 25),
              });
            } else {
              set({ enableReferrals: true, referralAmount: 25 });
            }
          },
          (err) => console.warn('Referral System listener error:', err)
        );
        unsubs.push(unsubReferral);

        // 3. Listen to Store Profile
        const unsubProfile = onSnapshot(
          doc(db, 'Store Settings', 'Profile'),
          (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              set({
                storeName: data?.storeName || 'Falguni Gruh Udhyog',
                storePhone: data?.phone || '+91 98765 43210',
                storeWhatsapp: data?.whatsapp || '+91 98765 43210',
                storeEmail: data?.email || 'support@falguni.com',
                storeAddress: data?.address || 'Shop No 1, Hirak Complex, Opposite Shakti Enclave, Nehru Park, Vastrapur',
                storeCity: data?.city || 'Ahmedabad',
                loading: false,
              });
            } else {
              set({ loading: false });
            }
          },
          (err) => {
            console.warn('Store Profile listener error:', err);
            set({ loading: false });
          }
        );
        unsubs.push(unsubProfile);
      } catch (e) {
        console.warn('Failed to attach settings listeners:', e);
        set({ loading: false });
      }

      return () => {
        unsubs.forEach((u) => u());
        unsubs = [];
        initialized = false;
      };
    },
  };
});
