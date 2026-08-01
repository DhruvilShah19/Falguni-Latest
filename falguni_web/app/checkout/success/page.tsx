'use client';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { clearCart } from '@/lib/firestore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

type OrderStatus = 'verifying' | 'success' | 'processing' | 'failed';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');

  // authStore's field is `loading`, not `isLoading` -- the mismatched key
  // here meant isAuthLoading was always undefined, so `if (isAuthLoading)
  // return` never actually held back verification. In practice that meant
  // this could run before Firebase auth finished hydrating on a fresh page
  // load right after the payment redirect, so firebaseUser could still be
  // null for a genuinely logged-in customer -- skipping clearCart() for a
  // real, successful order and leaving stale items in their cart.
  const { firebaseUser, loading: isAuthLoading } = useAuthStore();
  const { clearCoupon } = useCartStore();

  const [status, setStatus] = useState<OrderStatus>('verifying');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // If there's no order_id in URL, it means they navigated here manually. Just show success if cart is empty.
    if (!orderId) {
      setStatus('success');
      return;
    }

    // Wait for auth to settle so we can clear their cart
    if (isAuthLoading) return;

    let isMounted = true;

    const verifyOrder = async () => {
      try {
        const res = await fetch(`/api/cashfree/verify?orderId=${orderId}`);
        const data = await res.json();

        if (!isMounted) return;

        if (res.ok && data.isPaid) {
          if (firebaseUser) {
            await clearCart(firebaseUser.uid);
            clearCoupon();
          }
          setStatus('success');
        } else if (res.ok && data.cfStatus === 'ACTIVE') {
          // Genuinely ambiguous, not a confirmed failure: the order is
          // still open on Cashfree's side, meaning payment hasn't actually
          // been confirmed yet (it may still be processing, or may never
          // complete). This used to be treated as a success -- clearing the
          // cart and showing "Order Placed!" -- on the assumption the
          // webhook would "catch up" shortly. If the payment instead never
          // completes, that left the customer believing they had an order
          // (and an empty cart) when neither was true. Show a distinct
          // "still confirming" state instead: don't clear the cart, don't
          // claim success. The webhook/verify promotion (lib/orderPromotion.ts)
          // will create the real order the moment it's actually confirmed,
          // whether or not the customer is still on this page.
          setStatus('processing');
        } else {
          setStatus('failed');
          setErrorMsg(data.error || data.message || 'Payment was not successful or was cancelled.');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setStatus('failed');
        setErrorMsg('Failed to connect to the verification server.');
      }
    };

    verifyOrder();

    return () => { isMounted = false; };
  }, [orderId, firebaseUser, isAuthLoading, clearCoupon]);

  if (status === 'verifying') {
    return (
      <div className="max-w-md mx-auto px-4 py-32 flex flex-col items-center text-center gap-6 animate-fade-in">
        <LoadingSpinner />
        <h2 className="text-[#D4AF37] font-bold tracking-[0.2em] uppercase text-sm animate-pulse">
          Verifying Payment...
        </h2>
        <p className="text-white/50 text-xs">Please do not close this page</p>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 flex flex-col items-center text-center gap-5 animate-fade-up">
        <div className="w-24 h-24 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-4">
          <Clock size={48} className="text-[#D4AF37]" />
        </div>
        <h1 className="text-3xl font-serif italic text-white">Confirming Payment...</h1>
        <p className="text-white/60 text-sm leading-relaxed">
          We haven't received final confirmation from your bank yet. If money was deducted, your order will appear
          automatically -- please check Order History in a few minutes rather than paying again.
        </p>
        <div className="flex w-full mt-6">
          <Link
            href="/orders"
            className="w-full py-4 bg-[#D4AF37] text-[#1A110D] font-black uppercase tracking-[0.1em] rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:bg-white transition-all text-sm text-center"
          >
            Check Order History
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 flex flex-col items-center text-center gap-5 animate-fade-up">
        <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <XCircle size={48} className="text-red-500" />
        </div>
        <h1 className="text-3xl font-serif italic text-white">Payment Failed</h1>
        <p className="text-white/60 text-sm leading-relaxed">
          {errorMsg}
        </p>
        <div className="flex w-full mt-6">
          <Link
            href="/checkout"
            className="w-full py-4 bg-[#D4AF37] text-[#1A110D] font-black uppercase tracking-[0.1em] rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:bg-white transition-all text-sm text-center"
          >
            Return to Checkout
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-24 flex flex-col items-center text-center gap-5 animate-fade-up">
      <div className="w-32 h-32 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-8 relative">
        <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
        <CheckCircle size={64} className="text-green-400 relative z-10 animate-bounce" />
      </div>
      <h1 className="text-4xl font-serif italic text-white mb-2">Order Placed!</h1>
      <p className="text-white/60 text-sm leading-relaxed mb-8">
        Your premium order has been secured successfully. We will update you as it gets prepared and dispatched.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Link
          href="/orders"
          className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors flex-1"
        >
          Track Order
        </Link>
        <Link
          href="/products"
          className="px-8 py-4 bg-[#D4AF37] hover:bg-[#C5A028] text-[#1A110D] font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all flex-1"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <PageShell>
      <div className="min-h-[80vh] flex flex-col justify-center bg-[#2B1B17]">
        <Suspense fallback={<div className="flex justify-center p-24"><LoadingSpinner /></div>}>
          <SuccessPageContent />
        </Suspense>
      </div>
    </PageShell>
  );
}
