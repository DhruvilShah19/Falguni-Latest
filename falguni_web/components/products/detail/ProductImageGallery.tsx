'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  discountPercent?: number;
  isBestseller?: boolean;
}

export default function ProductImageGallery({
  images,
  productName,
  discountPercent = 0,
  isBestseller = false,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Fallback to placeholder if images array is empty
  const displayImages = images.length > 0 ? images : ['/4_1.webp'];
  const activeImage = displayImages[selectedIndex] || displayImages[0];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ── Main Product Display ── */}
      <div className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square bg-[#FAF7F2] rounded-2xl md:rounded-3xl border border-[#EFE6DC] overflow-hidden shadow-xs group">
        <Image
          src={activeImage}
          alt={`${productName} - View ${selectedIndex + 1}`}
          fill
          priority
          loading="eager"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 550px"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Badge: Bestseller or Discount */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
          {discountPercent > 0 ? (
            <span className="bg-[#B91C1C] text-white text-[11px] font-bold px-3 py-1 rounded-md uppercase tracking-wider shadow-sm">
              {discountPercent}% OFF
            </span>
          ) : isBestseller ? (
            <span className="bg-[#733617] text-white text-[11px] font-bold px-3 py-1 rounded-md uppercase tracking-wider shadow-sm">
              BESTSELLER
            </span>
          ) : null}
        </div>

        {/* Zoom Lightbox Trigger */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          aria-label="Zoom image"
          className="absolute bottom-4 right-4 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-[#2D1508] shadow-md border border-[#EFE6DC] flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
        >
          <ZoomIn size={18} className="text-[#733617]" />
        </button>
      </div>

      {/* ── Thumbnails Strip (if > 1 image) ── */}
      {displayImages.length > 1 && (
        <div className="flex items-center gap-2 sm:gap-3 justify-center w-full px-1">
          <button
            onClick={handlePrev}
            aria-label="Previous image"
            className="w-8 h-8 rounded-full border border-[#EFE6DC] bg-white hover:bg-[#FAF7F2] text-[#65544A] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto py-1 scrollbar-none">
            {displayImages.map((img, idx) => {
              const isActive = idx === selectedIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 shrink-0 cursor-pointer bg-white ${
                    isActive
                      ? 'border-[#733617] shadow-xs scale-105'
                      : 'border-[#EFE6DC] opacity-75 hover:opacity-100 hover:border-[#733617]/50'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${productName} thumbnail ${idx + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover object-center"
                  />
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            aria-label="Next image"
            className="w-8 h-8 rounded-full border border-[#EFE6DC] bg-white hover:bg-[#FAF7F2] text-[#65544A] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── Lightbox Modal ── */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close preview"
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center cursor-pointer transition"
            >
              <X size={22} />
            </button>
            <div className="relative w-full h-full max-h-[85vh]">
              <Image
                src={activeImage}
                alt={productName}
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
