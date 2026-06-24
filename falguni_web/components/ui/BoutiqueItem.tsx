'use client';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductsModel } from '@/types';

/**
 * BoutiqueItem – shared editorial product card used across Search, Home, and PLP pages.
 * Tall 3:4 image, centered text, brand label, serif title, "View Details" pill.
 */
export default function BoutiqueItem({ product }: { product: ProductsModel }) {
  const price = product.unitPrice1 ?? 0;

  return (
    <Link href={`/products/${product.uid}`} className="group cursor-pointer flex flex-col mb-4 md:mb-8">
      {/* Image container */}
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl shadow-xl mb-3 md:mb-5">
        <div className="absolute inset-0 bg-[#D4AF37]/5 z-10 pointer-events-none group-hover:bg-transparent transition-colors duration-700" />
        {product.image1 ? (
          <Image 
            src={product.image1} 
            alt={product.name} 
            fill 
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover scale-100 group-hover:scale-105 transition-transform duration-[1.5s] ease-out saturate-110" 
          />
        ) : (
          <div className="w-full h-full bg-[#2B1B17] flex items-center justify-center opacity-20 text-4xl">✨</div>
        )}
      </div>

      {/* Info container */}
      <div className="flex flex-col items-center text-center px-1 md:px-2">
        <span className="text-[#D4AF37] text-[8px] md:text-[10px] font-bold tracking-[0.2em] uppercase mb-1.5 md:mb-2">
          {(product.brandName || product.category || 'Collection').toUpperCase()}
        </span>
        
        <h3 className="font-serif text-sm md:text-xl text-white leading-snug mb-2 md:mb-3 group-hover:text-[#D4AF37] transition-colors duration-500 line-clamp-2">
          {product.name}
        </h3>
        
        <div className="w-6 md:w-8 h-[1px] bg-white/20 mb-2.5 md:mb-4" />
        
        <div className="flex flex-col items-center gap-1.5 md:gap-2 w-full">
          <span className="text-xs md:text-base font-light tracking-widest text-white/90">
            ₹{price}
          </span>
          <span className="text-[8px] md:text-[10px] font-bold tracking-[0.1em] uppercase text-[#D4AF37] border border-[#D4AF37]/30 rounded-full px-3 md:px-4 py-1 md:py-1.5 mt-0.5 md:mt-1 group-hover:bg-[#D4AF37]/10 transition-colors duration-300">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}
