'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { ProductsModel } from '@/types';

interface ShopHeaderBannerProps {
  products?: ProductsModel[];
  title?: string;
  subtitle?: string;
  badge?: string;
}

export default function ShopHeaderBanner({ title, subtitle, badge }: ShopHeaderBannerProps) {
  return (
    <div className="relative w-full overflow-hidden bg-[#FAF7F2] border-b border-[#EFE6DC] py-4 sm:py-5 mb-5 sm:mb-6">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 relative z-10">
        {/* Left Text Block */}
        <div className="w-full md:w-1/2 flex flex-col items-start text-left">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-[#8A796F] mb-1.5 font-medium">
            <Link href="/" className="hover:text-[#733617] transition-colors">
              Home
            </Link>
            <span className="text-[#B5A599]">&gt;</span>
            <Link href="/products" className="hover:text-[#733617] transition-colors">
              Shop
            </Link>
            {title && title !== 'Shop All Products' && (
              <>
                <span className="text-[#B5A599]">&gt;</span>
                <span className="text-[#733617] font-semibold">{title}</span>
              </>
            )}
          </nav>

          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#733617] bg-[#F5EBE1] px-2.5 py-0.5 rounded-full border border-[#EFE6DC] mb-2">
              {badge}
            </span>
          )}

          {/* Heading */}
          <h1 className="font-serif text-2xl sm:text-3xl md:text-[34px] font-bold text-[#2D1508] tracking-tight mb-1.5 leading-tight">
            {title || 'Shop All Products'}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-[#65544A] max-w-md leading-relaxed font-normal">
            {subtitle || 'Explore our wide range of authentic homemade snacks, sweets & more.'}
          </p>
        </div>

        {/* Right Subtle Snack Bowls Panorama */}
        <div className="w-full md:w-1/2 hidden sm:flex items-center justify-end relative h-20 sm:h-24 md:h-28">
          <div className="relative w-full max-w-[500px] h-full overflow-hidden rounded-2xl">
            <Image
              src="/shop-banner-snacks.jpg"
              alt="Authentic Homemade Snacks & Delicacies"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 500px"
              className="object-cover object-right"
            />
            {/* Soft left gradient fade into the subtle background */}
            <div className="absolute inset-y-0 left-0 w-24 md:w-32 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/60 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
