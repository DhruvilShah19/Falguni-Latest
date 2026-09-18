'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import type { CartItem } from '@/types';

interface Props {
  items: CartItem[];
  onQuantityChange: (cartDocId: string, delta: number, currentQty: number, pricePerUnit: number) => void;
  onRemove: (cartDocId: string) => void;
  removingId: string | null;
}

export default function CartItemsTable({ items, onQuantityChange, onRemove, removingId }: Props) {
  return (
    <div className="w-full bg-white border border-[#EFE6DC] rounded-2xl overflow-hidden shadow-xs">
      {/* ── Table Header ── */}
      <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 bg-white border-b border-[#EFE6DC] text-xs font-semibold text-[#8A796F] tracking-wide">
        <div className="col-span-6 text-left">Product</div>
        <div className="col-span-2 text-center">Price</div>
        <div className="col-span-2 text-center">Quantity</div>
        <div className="col-span-2 text-right">Total</div>
      </div>

      {/* ── Items Rows ── */}
      <div className="divide-y divide-[#F0EAE1]">
        {items.map((item) => {
          const pricePerUnit = item.selectedPrice ?? item.unitPrice1 ?? item.price ?? 0;
          const currentQty = item.quantity ?? 1;
          const lineTotal = item.price ?? (pricePerUnit * currentQty);
          const weightLabel = item.selected || item.unitname1 || 'Standard Pack';
          const productHref = `/products/${item.uid || item.productID}`;

          return (
            <div
              key={item.cartDocId}
              className={`p-4 sm:px-6 sm:py-5 transition-opacity ${
                removingId === item.cartDocId ? 'opacity-40 pointer-events-none' : ''
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
                {/* 1. Product (Image + Title + Weight) */}
                <div className="sm:col-span-6 flex items-center gap-3 sm:gap-4">
                  <Link
                    href={productHref}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#FAF7F2] border border-[#EFE6DC] relative overflow-hidden shrink-0 flex items-center justify-center group"
                  >
                    {item.image1 ? (
                      <Image
                        src={item.image1}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 64px, 80px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-[#8A796F] opacity-40" />
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={productHref}
                      className="font-bold text-sm sm:text-base text-[#2D1508] hover:text-[#733617] transition line-clamp-2 leading-snug"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-[#8A796F] mt-0.5 font-medium">
                      {weightLabel}
                    </p>

                    {/* Mobile Only: Unit Price Inline */}
                    <div className="sm:hidden flex items-center justify-between mt-2 pt-2 border-t border-[#F0EAE1]">
                      <span className="text-xs text-[#8A796F]">Price: ₹{pricePerUnit}</span>
                      <span className="text-sm font-bold text-[#2D1508]">Total: ₹{lineTotal}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Price (Desktop) */}
                <div className="hidden sm:block sm:col-span-2 text-center text-sm sm:text-base font-bold text-[#2D1508]">
                  ₹{pricePerUnit}
                </div>

                {/* 3. Quantity (Desktop & Mobile) */}
                <div className="sm:col-span-2 flex flex-col items-center justify-center">
                  <div className="inline-flex items-center border border-[#DBCFC4] bg-white rounded-lg h-8 sm:h-9 overflow-hidden">
                    <button
                      onClick={() => onQuantityChange(item.cartDocId, -1, currentQty, pricePerUnit)}
                      disabled={currentQty <= 1}
                      aria-label="Decrease quantity"
                      className="px-2.5 h-full flex items-center justify-center text-[#65544A] hover:text-[#733617] hover:bg-[#FAF7F2] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <Minus size={13} strokeWidth={2.5} />
                    </button>
                    <span className="min-w-[28px] sm:min-w-[32px] text-center text-xs sm:text-sm font-bold text-[#2D1508] px-1">
                      {currentQty}
                    </span>
                    <button
                      onClick={() => onQuantityChange(item.cartDocId, 1, currentQty, pricePerUnit)}
                      aria-label="Increase quantity"
                      className="px-2.5 h-full flex items-center justify-center text-[#65544A] hover:text-[#733617] hover:bg-[#FAF7F2] transition-colors"
                    >
                      <Plus size={13} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Remove text button */}
                  <button
                    onClick={() => onRemove(item.cartDocId)}
                    className="text-[11px] sm:text-xs text-[#8A796F] hover:text-[#733617] underline mt-1.5 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>

                {/* 4. Total & Trash Icon */}
                <div className="hidden sm:flex sm:col-span-2 items-center justify-end gap-3 text-right">
                  <span className="text-sm sm:text-base font-bold text-[#2D1508]">
                    ₹{lineTotal}
                  </span>
                  <button
                    onClick={() => onRemove(item.cartDocId)}
                    aria-label={`Remove ${item.name}`}
                    className="text-[#B5A599] hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={16} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
