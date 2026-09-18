'use client';

import { create } from 'zustand';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { PopupBannerConfig } from '@/types';

interface PopupState {
  config: PopupBannerConfig | null;
  isOpen: boolean;
  loading: boolean;
  initializePopupListener: () => () => void;
  openPopup: () => void;
  closePopup: () => void;
}

export const usePopupStore = create<PopupState>((set, get) => {
  let unsub: (() => void) | null = null;
  let timer: NodeJS.Timeout | null = null;
  let initialized = false;

  return {
    config: null,
    isOpen: false,
    loading: true,

    openPopup: () => set({ isOpen: true }),

    closePopup: () => {
      set({ isOpen: false });
      if (typeof window !== 'undefined') {
        try {
          const config = get().config;
          const freq = config?.showFrequency || 'once_per_session';
          if (freq === 'once_per_day') {
            localStorage.setItem('falguni_popup_dismissed_at', Date.now().toString());
          } else if (freq === 'once_per_session') {
            sessionStorage.setItem('falguni_popup_dismissed', 'true');
          }
        } catch (e) {
          console.warn('Storage error on closing popup:', e);
        }
      }
    },

    initializePopupListener: () => {
      if (typeof window === 'undefined' || initialized) {
        return () => {};
      }
      initialized = true;

      try {
        unsub = onSnapshot(
          doc(db, 'Store Settings', 'Popup Banner'),
          (snap) => {
            if (snap.exists()) {
              const data = snap.data() as PopupBannerConfig;
              set({ config: data, loading: false });

              if (data?.enabled) {
                // Check dismissal history
                const freq = data.showFrequency || 'once_per_session';
                let alreadyDismissed = false;

                try {
                  if (freq === 'once_per_session') {
                    alreadyDismissed = sessionStorage.getItem('falguni_popup_dismissed') === 'true';
                  } else if (freq === 'once_per_day') {
                    const dismissedAt = localStorage.getItem('falguni_popup_dismissed_at');
                    if (dismissedAt) {
                      const diffHours = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60);
                      if (diffHours < 24) {
                        alreadyDismissed = true;
                      }
                    }
                  }
                } catch (_) {}

                if (!alreadyDismissed) {
                  if (timer) clearTimeout(timer);
                  const delay = (data.delaySeconds ?? 2) * 1000;
                  timer = setTimeout(() => {
                    set({ isOpen: true });
                  }, delay);
                }
              } else {
                set({ isOpen: false });
              }
            } else {
              set({ config: null, isOpen: false, loading: false });
            }
          },
          (err) => {
            console.warn('Popup Banner listener warning:', err);
            set({ loading: false });
          }
        );
      } catch (err) {
        console.warn('Failed to initialize popup listener:', err);
        set({ loading: false });
      }

      return () => {
        if (unsub) unsub();
        if (timer) clearTimeout(timer);
      };
    },
  };
});
