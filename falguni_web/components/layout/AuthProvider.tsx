'use client';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { subscribeToUserDoc, subscribeToCart } from '@/lib/firestore';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { useSettingsStore } from '@/store/settingsStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setFirebaseUser, setUserDoc, setLoading } = useAuthStore();
  const { setItems } = useCartStore();

  useEffect(() => {
    // 0. Listen to live Store Status (Open / Closed) across the entire application
    const storeStatusUnsub = useStoreStatusStore.getState().initializeListener();

    // 1. Listen to live Marketing & Store Settings (Coupons, Referral Rewards, Profile)
    const settingsUnsub = useSettingsStore.getState().initializeSettingsListeners();

    let cartUnsub: (() => void) | null = null;

    let userDocUnsub: (() => void) | null = null;

    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setLoading(false);

      if (user) {
        // Ensure user document exists in Firestore (with merge: true) non-blockingly
        getDoc(doc(db, 'users', user.uid))
          .then((snap) => {
            if (!snap.exists()) {
              setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                fullname: user.displayName || 'Friend',
                email: user.email || '',
                phone: user.phoneNumber || '',
                userPic: user.photoURL || '',
                DeliveryAddress: '',
                HouseNumber: '',
                ClosestBustStop: '',
                DeliveryAddressID: '',
                createdAt: serverTimestamp(),
              }, { merge: true }).catch((err) => console.warn('Could not set initial user doc:', err));
            }
          })
          .catch((e) => console.warn('Could not ensure user doc:', e));

        // Subscribe to user document for real-time updates (like default address changes)
        userDocUnsub = subscribeToUserDoc(user.uid, (doc) => {
          setUserDoc(doc as any);
        });
        
        // Subscribe to cart in real-time
        cartUnsub = subscribeToCart(user.uid, setItems);
      } else {
        setUserDoc(null);
        setItems([]);
        userDocUnsub?.();
        cartUnsub?.();
      }
    });

    return () => {
      settingsUnsub();
      storeStatusUnsub();
      unsub();
      userDocUnsub?.();
      cartUnsub?.();
    };
  }, [setFirebaseUser, setItems, setLoading, setUserDoc]);

  return <>{children}</>;
}
