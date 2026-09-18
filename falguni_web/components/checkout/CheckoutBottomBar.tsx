'use client';

import { Lock, ArrowRight } from 'lucide-react';

interface Props {
  onProceed: () => void;
  loading: boolean;
  disabled: boolean;
  storeOpen?: boolean;
}

export default function CheckoutBottomBar({
  onProceed,
  loading,
  disabled,
  storeOpen = true,
}: Props) {
  return (
    <div className="w-full bg-[#FAF7F2] border border-[#EFE6DC] rounded-2xl p-4 sm:p-5 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
      {/* ── Left: Security Notice ── */}
      <div className="flex items-center gap-3 text-left w-full sm:w-auto">
        <div className="w-9 h-9 rounded-xl bg-white border border-[#EFE6DC] flex items-center justify-center text-[#733617] shrink-0">
          <Lock size={18} strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-bold text-[#2D1508] leading-tight">
            100% Secure Checkout
          </p>
          <p className="text-[11px] text-[#8A796F] mt-0.5">
            Your information is safe with us
          </p>
        </div>
      </div>

      {/* ── Right: CTA Button ── */}
      <div className="w-full sm:w-auto">
        <button
          onClick={onProceed}
          disabled={disabled || loading || !storeOpen}
          className="w-full sm:w-auto min-w-[240px] py-3.5 px-8 rounded-xl bg-[#733617] hover:bg-[#5A290F] disabled:opacity-40 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:cursor-not-allowed"
        >
          {!storeOpen ? (
            'Store Currently Closed'
          ) : loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Initializing Payment...</span>
            </div>
          ) : (
            <>
              <span>Continue to Payment</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
