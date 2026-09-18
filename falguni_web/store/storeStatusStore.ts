'use client';

import { create } from 'zustand';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export interface StoreStatusState {
  isOpen: boolean;
  closedMessage: string;
  openTime: string;
  closeTime: string;
  loading: boolean;
  setStoreStatus: (data: Partial<StoreStatusState>) => void;
  initializeListener: () => () => void;
}

export const useStoreStatusStore = create<StoreStatusState>((set) => {
  let unsub: (() => void) | null = null;
  let initialized = false;

  return {
    isOpen: true,
    closedMessage:
      'Our store is currently closed for the night. We will reopen tomorrow at 9:00 AM. You can still browse our products!',
    openTime: '09:00 AM',
    closeTime: '09:00 PM',
    loading: true,

    setStoreStatus: (data) => set((prev) => ({ ...prev, ...data })),

    initializeListener: () => {
      if (typeof window === 'undefined' || initialized) {
        return () => {};
      }
      initialized = true;

      try {
        unsub = onSnapshot(
          doc(db, 'Store Settings', 'Store Status'),
          (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              set({
                isOpen: data?.isOpen !== false,
                closedMessage:
                  data?.closedMessage ||
                  'Our store is currently closed for the night. We will reopen tomorrow at 9:00 AM. You can still browse our products!',
                openTime: data?.openTime || '09:00 AM',
                closeTime: data?.closeTime || '09:00 PM',
                loading: false,
              });
            } else {
              set({ isOpen: true, loading: false });
            }
          },
          (err) => {
            console.warn('Store status listener error:', err);
            set({ loading: false });
          }
        );
      } catch (e) {
        console.warn('Failed to attach Store Status snapshot:', e);
        set({ loading: false });
      }

      return () => {
        unsub?.();
        unsub = null;
        initialized = false;
      };
    },
  };
});
