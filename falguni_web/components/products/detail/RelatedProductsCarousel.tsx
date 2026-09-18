'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react';
import type { ProductsModel } from '@/types';

interface RelatedProductsCarouselProps {
  products: ProductsModel[];
  onQuickAdd: (product: ProductsModel) => Promise<void> | void;
}

export default function RelatedProductsCarousel({
  products,
  onQuickAdd,
}: RelatedProductsCarouselProps) {
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleAdd = async (product: ProductsModel) => {
    const id = product.uid || product.name;
    setAddedIds((prev) => new Set(prev).add(id));
    await onQuickAdd(product);
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2000);
  };

  return (
    <div className="w-full bg-white border border-[#EFE6DC] rounded-3xl p-6 sm:p-8 mb-8 shadow-xs relative">
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1508]">
          You may also love
        </h3>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
            className="w-8 h-8 rounded-full border border-[#EFE6DC] bg-white hover:bg-[#FAF7F2] text-[#65544A] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => handleScroll('right')}
            aria-label="Scroll right"
            className="w-8 h-8 rounded-full border border-[#EFE6DC] bg-white hover:bg-[#FAF7F2] text-[#65544A] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── Horizontal Scrollable Grid / Carousel ── */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none scroll-smooth"
      >
        {products.map((item, idx) => {
          const id = item.uid || item.name;
          const price = item.unitPrice1 ?? item.price ?? 100;
          const weight = item.unitname1 || '200g';
          const isAdded = addedIds.has(id);
          const image = item.image1 || '/4_1.webp';

          return (
            <div
              key={id || idx}
              className="w-[180px] sm:w-[210px] shrink-0 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EFE6DC] hover:border-[#733617]/40 flex flex-col justify-between transition-all duration-200 shadow-2xs group"
            >
              {/* Image & Link */}
              <Link
                href={`/products/${encodeURIComponent(id)}`}
                className="flex flex-col items-center"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white border border-[#EFE6DC] mb-3">
                  <Image
                    src={image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 180px, 210px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-[#2D1508] truncate w-full text-left group-hover:text-[#733617] transition-colors">
                  {item.name}
                </h4>
                <p className="text-[11px] text-[#8A796F] w-full text-left mt-0.5">{weight}</p>
              </Link>

              {/* Price & Add Button */}
              <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#EFE6DC]">
                <span className="text-xs sm:text-sm font-black text-[#2D1508]">₹{price}</span>

                <button
                  type="button"
                  onClick={() => handleAdd(item)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border flex items-center gap-1 ${
                    isAdded
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-[#733617] text-[#733617] bg-white hover:bg-[#733617] hover:text-white'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check size={12} />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus size={12} />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
