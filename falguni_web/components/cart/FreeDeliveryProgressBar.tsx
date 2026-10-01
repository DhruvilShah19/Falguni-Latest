'use client';

import { CheckCircle2, Sparkles, Store } from 'lucide-react';

interface Props {
  subtotal: number;
  threshold?: number;
  isPickup?: boolean;
  onToggleDelivery?: () => void;
}

export default function FreeDeliveryProgressBar({
  subtotal,

  isPickup = false,
  onToggleDelivery,
}: Props) {
  if (isPickup) {
    return (
      <div className="w-full bg-[#FAF7F2] border border-[#EFE6DC] rounded-xl p-3.5 sm:p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#2D1508]">
          <div className="w-7 h-7 rounded-lg bg-white border border-[#EFE6DC] flex items-center justify-center shrink-0 text-[#733617]">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#733617]">Store Pickup Selected</span>
            <span className="text-[#65544A] block sm:inline sm:ml-1.5">
              • Collect in-person from our Vastrapur flagship store with zero delivery fees.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
            ₹0 FREE
          </span>
          {onToggleDelivery && (
            <button
              type="button"
              onClick={onToggleDelivery}
              className="text-xs text-[#733617] hover:underline font-semibold ml-1 cursor-pointer"
            >
              Switch to Delivery
            </button>
          )}
        </div>
      </div>
    );
  }

  return <div className="rounded-xl border border-[#EFE6DC] p-4 mb-6 text-sm">
    Delivery is calculated at checkout from your address and eligible cart value. Outstation charges also depend on weight, with free-weight allowances up to 15 kg.
  </div>;
}
