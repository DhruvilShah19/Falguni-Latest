'use client';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserDoc } from '@/lib/firestore';
import { useAuthStore } from '@/store/authStore';
import { subscribeToCart } from '@/lib/firestore';
import { useCartStore } from '@/store/cartStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setFirebaseUser, setUserDoc, setLoading } = useAuthStore();
  const { setItems } = useCartStore();

  useEffect(() => {
    let cartUnsub: (() => void) | null = null;

    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        const doc = await getUserDoc(user.uid);
        setUserDoc(doc as any);
        // Subscribe to cart in real-time (mirrors Flutter's Cart stream)
        cartUnsub = subscribeToCart(user.uid, setItems);
      } else {
        setUserDoc(null);
        setItems([]);
        cartUnsub?.();
      }

      setLoading(false);
    });

    return () => {
      unsub();
      cartUnsub?.();
    };
  }, []);

  return <>{children}</>;
}
