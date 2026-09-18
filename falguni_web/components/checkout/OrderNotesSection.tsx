'use client';

import { FileText } from 'lucide-react';

interface Props {
  notes: string;
  onNotesChange: (notes: string) => void;
  stepNumber?: number;
}

export default function OrderNotesSection({ notes, onNotesChange, stepNumber = 2 }: Props) {
  const MAX_CHARS = 150;

  return (
    <div className="w-full bg-white border border-[#EFE6DC] rounded-2xl p-5 sm:p-6 shadow-xs mt-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#EFE6DC]">
        <FileText className="w-4 h-4 text-[#733617]" />
        <h2 className="font-serif text-base sm:text-lg font-bold text-[#2D1508]">
          {stepNumber}. Order Notes (Optional)
        </h2>
      </div>

      {/* ── Textarea ── */}
      <div className="relative">
        <textarea
          rows={3}
          maxLength={MAX_CHARS}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Add special instructions for your order..."
          className="w-full bg-[#FAF7F2] border border-[#EFE6DC] focus:border-[#733617] rounded-xl p-3.5 pb-7 text-xs sm:text-sm text-[#2D1508] placeholder-[#A39286] outline-none transition resize-none"
        />
        <span className="absolute right-3 bottom-2 text-[11px] text-[#A39286] pointer-events-none select-none">
          {notes.length}/{MAX_CHARS}
        </span>
      </div>
    </div>
  );
}
