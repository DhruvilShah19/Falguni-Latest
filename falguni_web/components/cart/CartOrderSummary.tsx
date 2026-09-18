'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Truck, Store, ShieldCheck, RotateCcw, Headphones, Tag, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { validateCoupon } from '@/lib/firestore';
import { useCartStore } from '@/store/cartStore';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { useSettingsStore } from '@/store/settingsStore';

interface Props {
  itemCount: number;
  subtotal: number;
  freeShippingThreshold?: number;
}

export default function CartOrderSummary({
  itemCount,
  subtotal,
  freeShippingThreshold = 699,
}: Props) {
  const { couponCode, couponDiscount, setCoupon, clearCoupon, isPickup, setIsPickup } = useCartStore();
  const { isOpen, openTime } = useStoreStatusStore();
  const { enableCoupons } = useSettingsStore();

  const [couponOpen, setCouponOpen] = useState(Boolean(couponCode));
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Automatically reset applied coupon if store disabled coupon acceptance
  useEffect(() => {
    if (!enableCoupons && couponCode) {
      clearCoupon();
    }
  }, [enableCoupons, couponCode, clearCoupon]);

  // Free shipping & pickup logic
  const isFreeDelivery = subtotal >= freeShippingThreshold;
  const baseShipping = isPickup ? 0 : 60;
  const shippingDiscount = isPickup ? 0 : isFreeDelivery ? 60 : 0;
  const netShipping = baseShipping - shippingDiscount;

  // Coupon discount calculation
  const couponSavings = couponDiscount > 0 ? (subtotal * couponDiscount) / 100 : 0;
  const total = Math.max(0, subtotal - couponSavings + netShipping);

  const handleApplyCoupon = async () => {
    if (!enableCoupons) {
      setCouponError('Promotional coupons are currently paused by the store.');
      return;
    }
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const coupon = await validateCoupon(couponInput.trim().toUpperCase());
      if (coupon) {
        setCoupon(couponInput.trim().toUpperCase(), coupon.percentage);
        setCouponInput('');
      } else {
        setCouponError('Invalid or expired coupon code.');
      }
    } catch {
      setCouponError('Could not validate coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <div className="w-full bg-white border border-[#EFE6DC] rounded-2xl p-5 sm:p-6 shadow-xs sticky top-28">
      {/* Title */}
      <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1508] mb-4">
        Order Summary
      </h2>

      {/* ── Fulfillment Method Segmented Switch ── */}
      <div className="mb-5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#8A796F] block mb-2">
          Fulfillment Option
        </label>
        <div className="flex bg-[#FAF7F2] p-1 rounded-xl border border-[#EFE6DC]">
          <button
            type="button"
            onClick={() => setIsPickup(false)}
            className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              !isPickup
                ? 'bg-[#733617] text-white shadow-xs'
                : 'text-[#8A796F] hover:text-[#2D1508]'
            }`}
          >
            <Truck size={13} />
            <span>Delivery</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPickup(true)}
            className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              isPickup
                ? 'bg-[#733617] text-white shadow-xs'
                : 'text-[#8A796F] hover:text-[#2D1508]'
            }`}
          >
            <Store size={13} />
            <span>Store Pickup (Free)</span>
          </button>
        </div>

        {/* Micro-detail note under switch */}
        <div className="mt-2 text-[11px] text-[#65544A] flex items-center gap-1.5">
          {isPickup ? (
            <span className="flex items-center gap-1 text-[#733617] font-semibold">
              <Store size={12} className="shrink-0" />
              <span>Collect at Vastrapur Store • <strong className="text-[#2E7D32]">₹0 FREE</strong></span>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Truck size={12} className="text-[#733617] shrink-0" />
              {isFreeDelivery ? (
                <span className="text-[#2E7D32] font-semibold">Free Delivery Unlocked!</span>
              ) : (
                <span>Standard Delivery: ₹60 (Free above ₹{freeShippingThreshold})</span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Breakdown Rows */}
      <div className="space-y-3 text-sm">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-[#2D1508]">
          <span className="text-[#65544A]">
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="font-bold">₹{subtotal.toFixed(0)}</span>
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between text-[#2D1508]">
          <span className="text-[#65544A]">
            {isPickup ? 'Store Pickup Fee' : 'Shipping'}
          </span>
          <span className={`font-bold ${isPickup ? 'text-[#2E7D32]' : ''}`}>
            {isPickup ? 'FREE' : `₹${baseShipping}`}
          </span>
        </div>

        {/* Discount on Shipping (when eligible for home delivery) */}
        {!isPickup && isFreeDelivery && (
          <div className="flex items-center justify-between text-[#2E7D32] font-medium">
            <span>Discount on Shipping</span>
            <span className="font-bold">-₹{shippingDiscount}</span>
          </div>
        )}

        {/* Coupon Discount (if applied) */}
        {couponDiscount > 0 && (
          <div className="flex items-center justify-between text-[#2E7D32] font-medium">
            <span className="flex items-center gap-1">
              <span>Coupon Discount</span>
              <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded text-[#2E7D32] font-bold">
                {couponCode} (-{couponDiscount}%)
              </span>
            </span>
            <span className="font-bold">-₹{couponSavings.toFixed(0)}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-[#EFE6DC] my-4" />

      {/* Total Row */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <span className="block text-base sm:text-lg font-bold text-[#2D1508]">
            Total
          </span>
          <span className="block text-[11px] text-[#8A796F] font-normal">
            (Inclusive of all taxes)
          </span>
        </div>
        <span className="text-2xl sm:text-[28px] font-black text-[#2D1508] tracking-tight">
          ₹{total.toFixed(0)}
        </span>
      </div>

      {/* Fulfillment Status Banner */}
      {isPickup ? (
        <div className="bg-[#FAF7F2] border border-[#EFE6DC] rounded-xl p-3 my-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white border border-[#EFE6DC] flex items-center justify-center shrink-0 text-[#733617]">
            <Store className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#733617] uppercase tracking-wider">
              Free Store Pickup Selected
            </p>
            <p className="text-[11px] text-[#65544A] mt-0.5">
              Collect at our Vastrapur flagship store with zero delivery fees.
            </p>
          </div>
        </div>
      ) : isFreeDelivery ? (
        <div className="bg-[#F0F7F2] border border-[#D5EAD9] rounded-xl p-3 my-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white border border-[#D5EAD9] flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#2E7D32] uppercase tracking-wider">
              Free Delivery Applied
            </p>
            <p className="text-[11px] text-[#3B6645] mt-0.5">
              You saved ₹60 on shipping!
            </p>
          </div>
        </div>
      ) : null}

      {/* Action Buttons */}
      <div className="space-y-2.5 mt-5">
        {!isOpen ? (
          <div>
            <button
              type="button"
              disabled
              className="w-full py-3.5 rounded-xl bg-[#EFE6DC] text-[#8A796F] font-bold text-xs sm:text-sm uppercase tracking-wider text-center block cursor-not-allowed border border-[#D9C7B6]"
            >
              Checkout Paused • Store Closed
            </button>
            <p className="text-[11px] text-[#8A796F] text-center mt-2 font-medium">
              * Live orders resume at {openTime}. Items stay in cart.
            </p>
          </div>
        ) : (
          <Link
            href="/checkout"
            className="w-full py-3.5 rounded-xl bg-[#733617] hover:bg-[#5A290F] text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition text-center block shadow-xs"
          >
            Proceed to Checkout
          </Link>
        )}

        <Link
          href="/products"
          className="w-full py-3 rounded-xl border border-[#733617] text-[#733617] hover:bg-[#FAF7F2] font-bold text-xs sm:text-sm uppercase tracking-wider transition text-center block"
        >
          Continue Shopping
        </Link>
      </div>

      {/* Subtle Coupon Toggle */}
      <div className="mt-4 pt-4 border-t border-[#EFE6DC]">
        {!enableCoupons ? (
          <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] text-center">
            <span className="text-[11px] text-[#8A796F] font-medium flex items-center justify-center gap-1.5">
              <Tag size={12} className="text-[#8A796F]" />
              <span>Promotional coupons are currently paused by the store.</span>
            </span>
          </div>
        ) : (
          <>
            <button
              onClick={() => setCouponOpen(!couponOpen)}
              className="w-full flex items-center justify-between text-xs font-bold text-[#733617] hover:text-[#5A290F] transition py-1"
            >
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <Tag size={13} />
                {couponCode ? `Coupon Applied: ${couponCode}` : 'Have a Promo Code?'}
              </span>
              {couponOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {couponOpen && (
              <div className="mt-2.5 pt-2">
                {couponCode ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-[#2E7D32]">
                    <span className="font-semibold">
                      <Check className="inline w-3.5 h-3.5 mr-1" />
                      {couponCode} applied ({couponDiscount}% off)
                    </span>
                    <button
                      onClick={clearCoupon}
                      className="text-red-600 hover:text-red-700 p-1"
                      aria-label="Remove coupon"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError('');
                      }}
                      className="flex-1 bg-[#FAF7F2] border border-[#EFE6DC] rounded-lg px-3 py-2 text-xs uppercase font-bold text-[#2D1508] placeholder-[#A39286] outline-none focus:border-[#733617]"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-4 py-2 bg-[#733617] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#5A290F] disabled:opacity-40 transition"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-[11px] text-red-600 mt-1.5">{couponError}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Trust Badges Strip */}
      <div className="mt-5 pt-5 border-t border-[#EFE6DC] space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Secure Payments */}
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#733617] shrink-0" strokeWidth={1.8} />
            <div>
              <p className="text-xs font-bold text-[#2D1508] leading-tight">
                Secure Payments
              </p>
              <p className="text-[10px] text-[#8A796F]">100% Protected</p>
            </div>
          </div>

          {/* Easy Returns */}
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-[#733617] shrink-0" strokeWidth={1.8} />
            <div>
              <p className="text-xs font-bold text-[#2D1508] leading-tight">
                Easy Returns
              </p>
              <p className="text-[10px] text-[#8A796F]">Hassle free</p>
            </div>
          </div>
        </div>

        {/* Quick Support */}
        <div className="flex items-center gap-2 pt-1">
          <Headphones className="w-4 h-4 text-[#733617] shrink-0" strokeWidth={1.8} />
          <div>
            <p className="text-xs font-bold text-[#2D1508] leading-tight">
              Quick Support
            </p>
            <p className="text-[10px] text-[#8A796F]">We&apos;re here to help</p>
          </div>
        </div>
      </div>
    </div>
  );
}
