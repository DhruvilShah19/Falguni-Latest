'use client';

import { Truck } from 'lucide-react';

export type DeliverySpeed = 'standard' | 'express';

interface Props {
  subtotal: number;
  selectedSpeed: DeliverySpeed;
  onSelectSpeed: (speed: DeliverySpeed) => void;
  freeThreshold?: number;
}

export default function DeliveryOptionsSection({
  subtotal,
  selectedSpeed,
  onSelectSpeed,
  freeThreshold = 699,
}: Props) {
  const isFreeStandard = subtotal >= freeThreshold;

  return (
    <div className="w-full bg-white border border-[#EFE6DC] rounded-2xl p-5 sm:p-6 shadow-xs mt-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#EFE6DC]">
        <Truck className="w-4 h-4 text-[#733617]" />
        <h2 className="font-serif text-base sm:text-lg font-bold text-[#2D1508]">
          2. Delivery Option
        </h2>
      </div>

      {/* ── Options List ── */}
      <div className="space-y-3">
        {/* Option 1: Standard */}
        <div
          onClick={() => onSelectSpeed('standard')}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
            selectedSpeed === 'standard'
              ? 'border-[#733617] bg-white shadow-xs'
              : 'border-[#EFE6DC] bg-white hover:border-[#DBCFC4]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                selectedSpeed === 'standard'
                  ? 'border-[#733617] bg-white'
                  : 'border-[#DBCFC4] bg-white'
              }`}
            >
              {selectedSpeed === 'standard' && (
                <div className="w-2 h-2 rounded-full bg-[#733617]" />
              )}
            </div>

            <div>
              <p className="font-bold text-xs sm:text-sm text-[#2D1508]">
                Standard Delivery (1-2 Days)
              </p>
              <p className="text-[11px] text-[#8A796F] mt-0.5">
                Free delivery on orders above ₹{freeThreshold}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            {isFreeStandard ? (
              <span className="text-xs sm:text-sm font-bold text-[#2E7D32]">
                FREE
              </span>
            ) : (
              <span className="text-xs sm:text-sm font-bold text-[#2D1508]">
                ₹60
              </span>
            )}
          </div>
        </div>

        {/* Option 2: Express */}
        <div
          onClick={() => onSelectSpeed('express')}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
            selectedSpeed === 'express'
              ? 'border-[#733617] bg-white shadow-xs'
              : 'border-[#EFE6DC] bg-white hover:border-[#DBCFC4]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                selectedSpeed === 'express'
                  ? 'border-[#733617] bg-white'
                  : 'border-[#DBCFC4] bg-white'
              }`}
            >
              {selectedSpeed === 'express' && (
                <div className="w-2 h-2 rounded-full bg-[#733617]" />
              )}
            </div>

            <div>
              <p className="font-bold text-xs sm:text-sm text-[#2D1508]">
                Express Delivery (Next Day)
              </p>
              <p className="text-[11px] text-[#8A796F] mt-0.5">
                Get your order by tomorrow
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs sm:text-sm font-bold text-[#2D1508]">
              ₹80
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
