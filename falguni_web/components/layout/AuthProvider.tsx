'use client';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserDoc, subscribeToUserDoc } from '@/lib/firestore';
import { useAuthStore } from '@/store/authStore';
import { subscribeToCart } from '@/lib/firestore';
import { useCartStore } from '@/store/cartStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setFirebaseUser, setUserDoc, setLoading } = useAuthStore();
  const { setItems } = useCartStore();

  useEffect(() => {
    let cartUnsub: (() => void) | null = null;

    let userDocUnsub: (() => void) | null = null;

    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
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

      setLoading(false);
    });

    return () => {
      unsub();
      userDocUnsub?.();
      cartUnsub?.();
    };
  }, []);

  return <>{children}</>;
}
