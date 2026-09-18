'use client';

import Image from 'next/image';
import { ShoppingBag, Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';
import type { CartItem } from '@/types';
import type { DeliverySpeed } from './DeliveryOptionsSection';

interface Props {
  items: CartItem[];
  subtotal: number;
  deliverySpeed?: DeliverySpeed;
  isPickup?: boolean;
  freeShippingThreshold?: number;
  couponDiscount?: number;
  couponCode?: string;
}

export default function CheckoutOrderSummary({
  items,
  subtotal,
  deliverySpeed = 'standard',
  isPickup = false,
  freeShippingThreshold = 699,
  couponDiscount = 0,
  couponCode = '',
}: Props) {
  const isFreeStandard = subtotal >= freeShippingThreshold;

  // Calculate shipping cost
  let shippingCost = 60;
  let shippingDiscount = 0;

  if (isPickup) {
    shippingCost = 0;
    shippingDiscount = 0;
  } else if (deliverySpeed === 'express') {
    shippingCost = 80;
    shippingDiscount = 0;
  } else {
    // Standard
    shippingCost = 60;
    shippingDiscount = isFreeStandard ? 60 : 0;
  }

  const netShipping = shippingCost - shippingDiscount;
  const couponSavings = couponDiscount > 0 ? (subtotal * couponDiscount) / 100 : 0;
  const total = Math.max(0, subtotal - couponSavings + netShipping);
  const totalQuantity = items.reduce((sum, i) => sum + (i.quantity || 1), 0);

  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="w-full bg-white border border-[#EFE6DC] rounded-2xl p-5 sm:p-6 shadow-xs">
      {/* ── Header ── */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#EFE6DC]">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-[#733617]" />
          <h2 className="font-serif text-base sm:text-lg font-bold text-[#2D1508]">
            Order Summary
          </h2>
        </div>
        <span className="text-xs font-semibold text-[#8A796F]">
          {totalQuantity} {totalQuantity === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {/* ── Mini Items List ── */}
      <div className="divide-y divide-[#F0EAE1] max-h-60 overflow-y-auto pr-1 custom-scrollbar mb-5">
        {items.map((item) => {
          const pricePerUnit = item.selectedPrice ?? item.unitPrice1 ?? item.price ?? 0;
          const qty = item.quantity || 1;
          const lineTotal = item.price ?? (pricePerUnit * qty);
          const weightLabel = item.selected || item.unitname1 || 'Standard';

          return (
            <div key={item.cartDocId} className="py-3 flex items-center gap-3">
              {/* Dish Photo */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-[#FAF7F2] border border-[#EFE6DC] relative overflow-hidden shrink-0 flex items-center justify-center">
                {item.image1 ? (
                  <Image
                    src={item.image1}
                    alt={item.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <ShoppingBag className="w-5 h-5 text-[#8A796F] opacity-40" />
                )}
              </div>

              {/* Title & Variant */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-[#2D1508] truncate leading-tight">
                  {item.name}
                </h4>
                <p className="text-[11px] text-[#8A796F] mt-0.5 font-medium">
                  {weightLabel}
                </p>
                <p className="text-[10px] text-[#8A796F]">
                  Qty: {qty}
                </p>
              </div>

              {/* Line Price */}
              <div className="text-right shrink-0">
                <span className="font-bold text-xs sm:text-sm text-[#2D1508]">
                  ₹{lineTotal}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Breakdown ── */}
      <div className="space-y-2.5 pt-3 border-t border-[#EFE6DC] text-xs sm:text-sm">
        <div className="flex items-center justify-between text-[#2D1508]">
          <span className="text-[#65544A]">
            Subtotal ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})
          </span>
          <span className="font-bold">₹{subtotal.toFixed(0)}</span>
        </div>

        <div className="flex items-center justify-between text-[#2D1508]">
          <span className="text-[#65544A]">
            {isPickup ? 'Store Pickup (Vastrapur)' : 'Shipping'}
          </span>
          <span className="font-bold">
            {isPickup ? <span className="text-[#2E7D32]">FREE</span> : `₹${shippingCost}`}
          </span>
        </div>

        {!isPickup && shippingDiscount > 0 && (
          <div className="flex items-center justify-between text-[#2E7D32] font-medium">
            <span>Discount on Shipping</span>
            <span className="font-bold">-₹{shippingDiscount}</span>
          </div>
        )}

        {couponDiscount > 0 && (
          <div className="flex items-center justify-between text-[#2E7D32] font-medium">
            <span>Coupon Discount ({couponCode})</span>
            <span className="font-bold">-₹{couponSavings.toFixed(0)}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-[#EFE6DC] my-4" />

      {/* Total */}
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

      {/* ── Free Delivery Status Card ── */}
      <div className="bg-[#F0F7F2] border border-[#D5EAD9] rounded-xl p-3 my-4">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
            <span className="text-xs font-bold text-[#2E7D32]">
              {isPickup
                ? 'Store Pickup Selected'
                : isFreeStandard
                ? 'Yay! You got FREE delivery'
                : 'Free Delivery Target'}
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#2D1508]">
            {isPickup
              ? 'Free'
              : isFreeStandard
              ? 'Unlocked'
              : `₹${remainingForFree} more to go`}
          </span>
        </div>

        <p className="text-[10px] text-[#65544A] mb-2 leading-tight">
          {isPickup
            ? 'Pick up your freshly packed order from our Vastrapur flagship store with zero delivery fee.'
            : isFreeStandard
            ? 'Free standard shipping is applied to this order!'
            : `Add items worth ₹${remainingForFree} more to unlock FREE delivery.`}
        </p>

        {/* Progress Track */}
        <div className="w-full bg-[#E5DFD7] h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2E7D32] rounded-full transition-all duration-500"
            style={{ width: isPickup ? '100%' : `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ── Trust Badges Strip ── */}
      <div className="mt-4 pt-4 border-t border-[#EFE6DC] space-y-2.5">
        <div className="grid grid-cols-2 gap-2 text-left">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#733617] shrink-0" strokeWidth={1.8} />
            <div>
              <p className="text-[11px] font-bold text-[#2D1508] leading-tight">
                Secure Payments
              </p>
              <p className="text-[9px] text-[#8A796F]">100% Protected</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-[#733617] shrink-0" strokeWidth={1.8} />
            <div>
              <p className="text-[11px] font-bold text-[#2D1508] leading-tight">
                Easy Returns
              </p>
              <p className="text-[9px] text-[#8A796F]">Hassle free</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <Headphones className="w-3.5 h-3.5 text-[#733617] shrink-0" strokeWidth={1.8} />
          <div>
            <p className="text-[11px] font-bold text-[#2D1508] leading-tight">
              Quick Support
            </p>
            <p className="text-[9px] text-[#8A796F]">We&apos;re here to help</p>
          </div>
        </div>
      </div>
    </div>
  );
}
