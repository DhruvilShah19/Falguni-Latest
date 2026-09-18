'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { removeFromCart, updateCartItem } from '@/lib/firestore';
import PageShell from '@/components/layout/PageShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import FreeDeliveryProgressBar from '@/components/cart/FreeDeliveryProgressBar';
import CartItemsTable from '@/components/cart/CartItemsTable';
import CartGiftNote from '@/components/cart/CartGiftNote';
import CartFrequentlyBoughtTogether from '@/components/cart/CartFrequentlyBoughtTogether';
import CartOrderSummary from '@/components/cart/CartOrderSummary';

export default function CartPage() {
  const router = useRouter();
  const { firebaseUser, loading: authLoading } = useAuthStore();
  const { items, subTotal, totalQuantity, isPickup, setIsPickup } = useCartStore();
  const { isOpen, closedMessage, openTime } = useStoreStatusStore();

  const [removingId, setRemovingId] = useState<string | null>(null);

  // Redirect unauthenticated visitors to login
  useEffect(() => {
    if (!authLoading && firebaseUser === null) {
      router.push('/login');
    }
  }, [firebaseUser, authLoading, router]);

  const handleQtyChange = async (
    cartDocId: string,
    delta: number,
    currentQty: number,
    pricePerUnit: number
  ) => {
    if (!firebaseUser) return;
    const newQty = Math.max(1, currentQty + delta);
    await updateCartItem(firebaseUser.uid, cartDocId, {
      quantity: newQty,
      price: pricePerUnit * newQty,
    });
  };

  const handleRemove = async (cartDocId: string) => {
    if (!firebaseUser) return;
    setRemovingId(cartDocId);
    await removeFromCart(firebaseUser.uid, cartDocId);
    setRemovingId(null);
  };

  if (authLoading || !firebaseUser) {
    return (
      <PageShell>
        <div className="min-h-[60vh] bg-[#FAF7F2] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  const sub = subTotal();
  const itemCount = totalQuantity();

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAF7F2] text-[#2D1508] flex flex-col pt-4 sm:pt-6 pb-20 sm:pb-28">
        <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8">
          {/* ── 1. Breadcrumbs ── */}
          <nav className="flex items-center gap-1.5 text-xs text-[#8A796F] mb-4 sm:mb-6 font-medium">
            <Link href="/" className="hover:text-[#733617] transition-colors">
              Home
            </Link>
            <span className="text-[#B5A599]">&gt;</span>
            <span className="text-[#733617] font-semibold">Your Cart</span>
          </nav>

          {/* ── Empty Cart State ── */}
          {items.length === 0 ? (
            <div className="py-20 sm:py-28 flex flex-col items-center justify-center text-center bg-white border border-[#EFE6DC] rounded-2xl max-w-2xl mx-auto p-8 shadow-xs animate-fade-up">
              <div className="w-20 h-20 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] flex items-center justify-center mb-5 text-[#733617]">
                <ShoppingCart size={32} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1508] mb-2">
                Your cart is empty
              </h2>
              <p className="text-[#65544A] text-sm max-w-md mb-8 leading-relaxed">
                You haven&apos;t added any delicacies to your cart yet. Explore our handcrafted
                namkeen, crispy khakhras, and sweets.
              </p>
              <Link
                href="/products"
                className="px-8 py-3.5 rounded-xl bg-[#733617] hover:bg-[#5A290F] text-white text-xs font-bold uppercase tracking-widest transition shadow-xs"
              >
                Shop All Products
              </Link>
            </div>
          ) : (
            <>
              {/* ── 2. Page Heading & Subtitle ── */}
              <div className="mb-5 sm:mb-6">
                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#2D1508] tracking-tight">
                  Your Cart{' '}
                  <span className="font-sans font-normal text-lg sm:text-xl md:text-2xl text-[#65544A]">
                    ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-[#65544A] mt-1">
                  Delicious choices! Review your cart and proceed to checkout.
                </p>
              </div>

              {/* ── Store Closed Alert Banner ── */}
              {!isOpen && (
                <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#FFF8EE] border border-[#F3DFC1] text-[#733617] flex items-start gap-3.5 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[#F5EBE1] border border-[#EADDCF] flex items-center justify-center shrink-0 text-lg">
                    🌙
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-[#2D1508]">
                        Online Order Intake Paused
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#733617] text-white px-2 py-0.5 rounded">
                        Reopening at {openTime}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#65544A] mt-1 leading-relaxed">
                      {closedMessage}
                    </p>
                    <p className="text-[11px] text-[#8A796F] mt-1.5 font-medium">
                      ✓ Your cart items remain safely saved. You can proceed to checkout once our store reopens.
                    </p>
                  </div>
                </div>
              )}

              {/* ── 3. Free Delivery Progress Bar ── */}
              <FreeDeliveryProgressBar
                subtotal={sub}
                threshold={699}
                isPickup={isPickup}
                onToggleDelivery={() => setIsPickup(false)}
              />

              {/* ── 4. Main 2-Column Grid (8 cols left, 4 cols right) ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                {/* Left Column (8 cols): Items Table, Gift Note, Frequently Bought */}
                <div className="lg:col-span-8 w-full">
                  {/* Cart Items Table */}
                  <CartItemsTable
                    items={items}
                    onQuantityChange={handleQtyChange}
                    onRemove={handleRemove}
                    removingId={removingId}
                  />

                  {/* Add a Gift Note (Optional) */}
                  <CartGiftNote />

                  {/* Frequently Bought Together Carousel */}
                  <CartFrequentlyBoughtTogether />
                </div>

                {/* Right Column (4 cols): Sticky Order Summary & Trust Badges */}
                <div className="lg:col-span-4 w-full">
                  <CartOrderSummary
                    itemCount={itemCount}
                    subtotal={sub}
                    freeShippingThreshold={699}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Mobile Sticky Checkout Floating Bar ── */}
        {items.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md pt-3 pb-4 px-4 border-t border-[#EFE6DC] lg:hidden shadow-lg flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-[#8A796F] block">Total to pay</span>
              <span className="text-lg font-black text-[#2D1508]">
                ₹{(isPickup || sub >= 699 ? sub : sub + 60).toFixed(0)}
              </span>
            </div>
            {!isOpen ? (
              <button
                type="button"
                disabled
                className="flex-1 py-3 px-4 rounded-xl bg-[#EFE6DC] text-[#8A796F] font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1.5 cursor-not-allowed border border-[#D9C7B6]"
              >
                <span>Orders Paused • Store Closed</span>
              </button>
            ) : (
              <Link
                href="/checkout"
                className="flex-1 py-3 px-5 rounded-xl bg-[#733617] text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={15} />
              </Link>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
