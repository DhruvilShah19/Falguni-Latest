'use client';

import { Gift } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function CartGiftNote() {
  const { giftNote, setGiftNote } = useCartStore();
  const MAX_LENGTH = 150;

  return (
    <div className="w-full bg-white border border-[#EFE6DC] rounded-xl p-3.5 sm:p-4 mt-4 sm:mt-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        {/* Left: Gift Icon + Title */}
        <div className="flex items-center gap-2.5 shrink-0 text-[#2D1508]">
          <Gift className="w-5 h-5 text-[#733617] shrink-0" strokeWidth={1.8} />
          <span className="font-bold text-xs sm:text-sm">
            Add a Gift Note (Optional)
          </span>
        </div>

        {/* Right: Input + Character Count */}
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={giftNote}
            onChange={(e) => setGiftNote(e.target.value.slice(0, MAX_LENGTH))}
            placeholder="Write your message..."
            maxLength={MAX_LENGTH}
            className="w-full bg-[#FAF7F2] border border-[#EFE6DC] focus:border-[#733617] rounded-lg px-3.5 py-2 text-xs sm:text-sm text-[#2D1508] placeholder-[#A39286] outline-none transition pr-16"
          />
          <span className="absolute right-3 text-[11px] text-[#A39286] pointer-events-none select-none">
            {giftNote.length}/{MAX_LENGTH}
          </span>
        </div>
      </div>
    </div>
  );
}
