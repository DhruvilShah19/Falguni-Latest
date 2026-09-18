'use client';

import { useState } from 'react';
import { Truck, CheckCircle2, AlertCircle } from 'lucide-react';

interface DeliveryStatus {
  checked: boolean;
  available: boolean;
  etaText: string;
  isAhmedabad?: boolean;
}

export default function ProductDeliveryPincodeCard() {
  const [pincode, setPincode] = useState('');
  const [status, setStatus] = useState<DeliveryStatus>({
    checked: false,
    available: false,
    etaText: '',
  });

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pincode.replace(/\D/g, '').trim();

    if (clean.length !== 6) {
      setStatus({
        checked: true,
        available: false,
        etaText: 'Please enter a valid 6-digit Indian PIN code.',
      });
      return;
    }

    // Ahmedabad Hyperlocal & Intercity
    if (clean.startsWith('380') || clean.startsWith('382')) {
      setStatus({
        checked: true,
        available: true,
        etaText: 'Estimated delivery: Same Day / 1 - 2 Days (Ahmedabad)',
        isAhmedabad: true,
      });
    } else if (/^3[6-9]/.test(clean)) {
      // Gujarat Outstation
      setStatus({
        checked: true,
        available: true,
        etaText: 'Estimated delivery: 1 - 2 Days (Gujarat Express)',
      });
    } else {
      // PAN India
      setStatus({
        checked: true,
        available: true,
        etaText: 'Estimated delivery: 3 - 5 Days (All India Courier)',
      });
    }
  };

  return (
    <div className="w-full bg-[#FAF7F2] border border-[#EFE6DC] rounded-2xl p-4 sm:p-5 my-6 shadow-2xs">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* ── Left: Pincode Form (5 cols) ── */}
        <div className="md:col-span-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#2D1508] shrink-0">
            <Truck size={18} className="text-[#733617]" />
            <span>Deliver to your location</span>
          </div>

          <form onSubmit={handleCheckPincode} className="flex items-center w-full sm:w-auto">
            <input
              type="text"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter pincode"
              className="bg-white border border-[#EFE6DC] rounded-l-xl px-3 py-2 text-xs font-semibold text-[#2D1508] placeholder:text-[#8A796F] focus:outline-hidden focus:border-[#733617] w-28 sm:w-32"
            />
            <button
              type="submit"
              className="bg-[#733617] hover:bg-[#5A290F] text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-r-xl transition-colors cursor-pointer"
            >
              Check
            </button>
          </form>
        </div>

        {/* ── Center: Delivery Availability Status (4 cols) ── */}
        <div className="md:col-span-4 flex items-center gap-2 border-t md:border-t-0 md:border-l border-[#EFE6DC] pt-3 md:pt-0 md:pl-4">
          {status.checked ? (
            status.available ? (
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-700 font-bold leading-tight">Delivery Available</p>
                  <p className="text-[#65544A] text-[11px] mt-0.5">{status.etaText}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-xs">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-amber-700 text-xs">{status.etaText}</p>
              </div>
            )
          ) : (
            <div className="text-xs text-[#65544A] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Enter pincode to view live delivery timeline &amp; rates</span>
            </div>
          )}
        </div>

        {/* ── Right: Free Delivery Threshold Note (3 cols) ── */}
        <div className="md:col-span-3 flex items-center justify-start md:justify-end gap-2 text-xs text-[#733617] font-semibold border-t md:border-t-0 md:border-l border-[#EFE6DC] pt-3 md:pt-0 md:pl-4">
          <Truck size={16} className="text-[#733617] shrink-0" />
          <span className="text-[11px] leading-tight">
            Free delivery on orders above ₹699
          </span>
        </div>
      </div>
    </div>
  );
}
