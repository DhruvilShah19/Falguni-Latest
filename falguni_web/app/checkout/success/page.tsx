'use client';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { clearCart } from '@/lib/firestore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { CheckCircle2, AlertCircle, Clock, Sparkles } from 'lucide-react';

type OrderStatus = 'verifying' | 'success' | 'processing' | 'failed';

function SuccessPageContent() {
  const searchParams = useSearchParams();
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
      } catch (_err: any) {
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
      <div className="max-w-lg mx-auto w-full bg-white border border-[#EFE6DC] rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col items-center text-center gap-6 animate-fade-in">
        <LoadingSpinner />
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[#733617] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">
          <Sparkles size={12} className="text-[#733617]" />
          <span>Falguni Parivar • ચકાસણી ચાલુ છે</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1508]">
          Verifying Payment...
        </h2>
        <p className="text-xs sm:text-sm text-[#65544A] max-w-sm leading-relaxed">
          Please keep this page open while we securely verify your payment transaction with our banking partner.
        </p>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="max-w-lg mx-auto w-full bg-white border border-[#EFE6DC] rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col items-center text-center gap-5 animate-fade-up">
        <div className="w-20 h-20 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center mb-2">
          <Clock size={40} className="text-[#733617]" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[#733617] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">
          <span>Payment In Progress</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1508]">Confirming Payment...</h1>
        <p className="text-xs sm:text-sm text-[#65544A] leading-relaxed max-w-md">
          We haven&apos;t received final confirmation from your bank yet. If money was deducted, your order will appear automatically in your Order History shortly &mdash; please avoid paying again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
          <Link
            href="/orders"
            className="w-full py-3.5 px-6 rounded-xl bg-[#733617] hover:bg-[#5C2B12] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs text-center"
          >
            Check Order History
          </Link>
          <Link
            href="/contact"
            className="w-full py-3.5 px-6 rounded-xl border border-[#EFE6DC] text-[#2D1508] hover:bg-[#FAF7F2] font-bold text-xs uppercase tracking-wider transition-all text-center"
          >
            Concierge Support
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="max-w-lg mx-auto w-full bg-white border border-red-200 rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col items-center text-center gap-5 animate-fade-up">
        <div className="w-20 h-20 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mb-2">
          <AlertCircle size={40} className="text-red-600" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-800 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">
          <span>Transaction Unsuccessful</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1508]">Payment Failed</h1>
        <p className="text-xs sm:text-sm text-[#65544A] leading-relaxed max-w-md">
          {errorMsg}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
          <Link
            href="/checkout"
            className="w-full py-3.5 px-6 rounded-xl bg-[#733617] hover:bg-[#5C2B12] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs text-center"
          >
            Return to Checkout
          </Link>
          <Link
            href="/cart"
            className="w-full py-3.5 px-6 rounded-xl border border-[#EFE6DC] text-[#2D1508] hover:bg-[#FAF7F2] font-bold text-xs uppercase tracking-wider transition-all text-center"
          >
            Review Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto w-full bg-white border border-[#EFE6DC] rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col items-center text-center gap-5 animate-fade-up">
      <div className="w-24 h-24 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-1">
        <CheckCircle2 size={48} className="text-emerald-700" />
      </div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[#733617] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">
        <Sparkles size={12} className="text-[#C88A2C]" />
        <span>Falguni Parivar • ઓર્ડર સફળ</span>
      </div>
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D1508]">Order Placed!</h1>
      {orderId && (
        <div className="px-3.5 py-1.5 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-xs font-mono font-semibold text-[#733617]">
          Order Reference: #{orderId}
        </div>
      )}
      <p className="text-xs sm:text-sm text-[#65544A] leading-relaxed max-w-md">
        Your artisanal order has been secured successfully. Our master confectioners and chefs will freshly prepare and dispatch your traditional delicacies.
      </p>

      {/* Next Steps Progress Indicators */}
      <div className="w-full grid grid-cols-3 gap-2 py-4 my-2 border-y border-[#EFE6DC] text-[11px] text-[#2D1508]">
        <div className="flex flex-col items-center gap-1">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">✓</span>
          <span className="font-bold text-[#733617]">Confirmed</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="w-6 h-6 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[#733617] font-bold flex items-center justify-center text-[10px]">2</span>
          <span className="text-[#65544A]">Fresh Packing</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="w-6 h-6 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] text-[#733617] font-bold flex items-center justify-center text-[10px]">3</span>
          <span className="text-[#65544A]">Express Dispatch</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2">
        <Link
          href="/orders"
          className="flex-1 py-3.5 px-6 rounded-xl bg-[#733617] hover:bg-[#5C2B12] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs text-center"
        >
          Track Order
        </Link>
        <Link
          href="/products"
          className="flex-1 py-3.5 px-6 rounded-xl border border-[#733617] text-[#733617] hover:bg-[#FAF7F2] font-bold text-xs uppercase tracking-wider transition-all text-center"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="pt-2 text-xs text-[#8A796F]">
        <Link href="/audit-orders" className="hover:text-[#733617] underline transition-colors">
          Download Tax Receipt &amp; Invoices
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <PageShell>
      <div className="min-h-[85vh] bg-[#FAF7F2] flex flex-col justify-center items-center py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="flex justify-center p-24"><LoadingSpinner /></div>}>
          <SuccessPageContent />
        </Suspense>
      </div>
    </PageShell>
  );
}
