'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Copy, Check, Sparkles } from 'lucide-react';
import { usePopupStore } from '@/store/popupStore';

export default function PromotionalPopup() {
  const router = useRouter();
  const { config, isOpen, closePopup, initializePopupListener } = usePopupStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsub = initializePopupListener();
    return () => unsub();
  }, [initializePopupListener]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closePopup();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closePopup]);

  if (!isOpen || !config || !config.enabled) {
    return null;
  }

  const {
    layout = 'split',
    eyebrow = 'ONLY TODAY!',
    title = '30% OFF',
    description = 'Discover our authentic handcrafted Gujarati delicacies made with heritage recipes.',
    imageUrl = 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&q=80',
    ctaText = 'Shop Now',
    ctaLink = '/products?sort=bestseller',
    showCouponCode = false,
    couponCode = '',
  } = config;

  const handleCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    closePopup();
    if (ctaLink) {
      router.push(ctaLink);
    }
  };

  const handleCopyCoupon = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (couponCode && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closePopup}
    >
      <div
        className="relative w-full max-w-xl md:max-w-2xl bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-[#EFE6DC] overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={closePopup}
          aria-label="Close popup"
          className="absolute top-3 right-3 z-30 w-8 h-8 md:w-9 md:h-9 bg-[#2B1B17] text-white hover:bg-[#D4AF37] transition-all rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95"
        >
          <X className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" />
        </button>

        {/* ─── 1. FULL BANNER LAYOUT ────────────────────────────────────────── */}
        {layout === 'banner' && imageUrl ? (
          <div className="relative w-full aspect-[16/9] md:aspect-[2/1] cursor-pointer" onClick={handleCtaClick}>
            <Image
              src={imageUrl}
              alt={title || 'Promotional Banner'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
            />
          </div>
        ) : null}

        {/* ─── 2. SPLIT LAYOUT (Default, matching user mockup) ──────────────── */}
        {layout !== 'banner' && (
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[340px]">
            {/* Left Image Section (5 cols) */}
            <div className="md:col-span-5 relative min-h-[180px] md:min-h-[360px] bg-[#FAF7F2] overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={title || 'Promotion'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-[#2B1B17]/30 bg-gradient-to-br from-[#FAF7F2] to-[#EFE6DC]">
                  <Sparkles className="w-12 h-12 mb-2 text-[#D4AF37]" />
                  <span className="text-xs font-serif italic text-[#2B1B17]/60">Falguni Gruh Udhyog</span>
                </div>
              )}
              {/* Subtle inner frame gradient */}
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />
            </div>

            {/* Right Text & Action Section (7 cols) */}
            <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-center text-left bg-white">
              {/* Eyebrow / Tagline */}
              {eyebrow && (
                <p className="text-[11px] md:text-xs font-bold tracking-widest text-[#D4AF37] uppercase mb-1.5 font-mono">
                  {eyebrow}
                </p>
              )}

              {/* Main Headline */}
              <h2 className="text-2xl md:text-3xl lg:text-[34px] font-extrabold text-[#2B1B17] tracking-tight leading-tight mb-3 font-serif">
                {title}
              </h2>

              {/* Description Body */}
              {description && (
                <p className="text-xs md:text-sm text-[#65544A] leading-relaxed mb-5 font-normal">
                  {description}
                </p>
              )}

              {/* Optional Coupon Code Box */}
              {showCouponCode && couponCode && (
                <div
                  onClick={handleCopyCoupon}
                  className="mb-5 inline-flex items-center justify-between gap-3 px-3.5 py-2 bg-[#FAF7F2] border-2 border-dashed border-[#D4AF37] rounded-xl cursor-pointer hover:bg-[#FAF7F2]/80 transition-all group"
                  title="Click to copy coupon"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-[#8A796F] tracking-wider">Use Coupon</span>
                    <span className="font-mono text-sm md:text-base font-extrabold text-[#2B1B17] tracking-widest">
                      {couponCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-[#D4AF37]">
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-green-600 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        <span>Copy</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Primary Call to Action Button */}
              {ctaText && (
                <button
                  onClick={handleCtaClick}
                  className="w-full md:w-auto inline-flex items-center justify-center px-7 py-3 bg-[#0288D1] hover:bg-[#0277BD] text-white font-bold text-sm tracking-wide rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-98"
                >
                  {ctaText}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
