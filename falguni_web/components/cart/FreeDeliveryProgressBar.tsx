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
  threshold = 699,
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

  const remaining = Math.max(0, threshold - subtotal);
  const isUnlocked = remaining === 0;
  const progressPercent = Math.min(100, Math.round((subtotal / threshold) * 100));

  return (
    <div className="w-full bg-[#F0F7F2] border border-[#D5EAD9] rounded-xl p-3.5 sm:p-4 mb-6 shadow-xs">
      <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-medium mb-2.5">
        <div className="flex items-center gap-2 text-[#2D1508]">
          {isUnlocked ? (
            <Sparkles className="w-4 h-4 text-[#2E7D32] shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
          )}
          <span>
            {isUnlocked ? (
              <span className="font-bold text-[#2E7D32]">
                🎉 Congratulations! You have unlocked FREE DELIVERY!
              </span>
            ) : (
              <span>
                You are eligible for <strong className="font-bold">FREE DELIVERY!</strong> Add{' '}
                <strong className="font-bold">₹{remaining}</strong> more to unlock it.
              </span>
            )}
          </span>
        </div>
        <span className="text-xs sm:text-sm font-bold text-[#2D1508] shrink-0">
          {isUnlocked ? (
            <span className="text-[#2E7D32]">Unlocked!</span>
          ) : (
            `₹${remaining} more to go`
          )}
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-[#E5DFD7] h-2 sm:h-2.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#733617] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
