'use client';

import Image from 'next/image';
import { ShoppingBag, Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';
import type { CartItem } from '@/types';
import type { DeliveryFeeResult } from '@/lib/deliveryPricing';

interface Props {
  items: CartItem[];
  subtotal: number;
  deliveryQuote?: (DeliveryFeeResult & { weightBasis: string }) | null;
  quotedTotal?: number;
  quoteMessage?: string;
  isPickup?: boolean;

  couponDiscount?: number;
  couponCode?: string;
}

export default function CheckoutOrderSummary({
  items,
  subtotal,
  deliveryQuote, quotedTotal, quoteMessage,
  isPickup = false,
  couponDiscount = 0,
  couponCode = '',
}: Props) {
  const shippingCost = isPickup ? 0 : deliveryQuote?.fee ?? 0;
  const netShipping = shippingCost;
  const couponSavings = couponDiscount > 0 ? (subtotal * couponDiscount) / 100 : 0;
  const total = quotedTotal ?? Math.max(0, subtotal - couponSavings + netShipping);
  const totalQuantity = items.reduce((sum, i) => sum + (i.quantity || 1), 0);

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
            {isPickup || deliveryQuote?.fee === 0 ? <span className="text-[#2E7D32]">FREE</span> : deliveryQuote ? `₹${shippingCost.toFixed(2)}` : 'Pending'}
          </span>
        </div>

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
          {quotedTotal === undefined ? 'Pending quote' : `₹${total.toFixed(2)}`}
        </span>
      </div>

      {!isPickup && <div className="rounded-xl bg-[#F0F7F2] p-3 my-4 text-sm space-y-1" aria-live="polite">
        {quoteMessage ? <p>{quoteMessage}</p> : deliveryQuote && <>
          <p>Delivery zone: {deliveryQuote.tier}</p>
          <p>Eligible cart value: ₹{deliveryQuote.cartValue.toFixed(2)}</p>
          {deliveryQuote.chargeableWeight !== null && <>
            <p>Chargeable weight: {deliveryQuote.chargeableWeight.toFixed(3)} kg</p>
            <p>Free allowance: {deliveryQuote.freeWeight} kg</p>
            <p>Additional weight: {deliveryQuote.excessWeight.toFixed(3)} kg × ₹{deliveryQuote.ratePerKg}/kg</p>
            {deliveryQuote.weightBasis === 'buffered-product-weight-estimate' && <p className="text-xs">Estimated packed weight includes a temporary packaging allowance. It is not a measured volumetric weight.</p>}
            {deliveryQuote.weightBasis === 'product-weight-estimate' && <p className="text-xs">Based on product weight; package dimensions are not yet available.</p>}
          </>}
        </>}
      </div>}

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
