'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import type { ProductsModel } from '@/types';
import type { ProductUnitOption } from './ProductPurchaseSection';

interface ProductStickyBottomBarProps {
  product: ProductsModel;
  activeUnit: ProductUnitOption;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  adding: boolean;
  added: boolean;
}

export default function ProductStickyBottomBar({
  product,
  activeUnit,
  quantity,
  onQuantityChange,
  onAddToCart,
  adding,
  added,
}: ProductStickyBottomBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when user has scrolled past ~450px
      setVisible(window.scrollY > 450);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  const image = product.image1 || '/4_1.webp';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EFE6DC] shadow-lg py-3 px-4 sm:px-6 transition-all duration-300 animate-slide-up">
      <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Product Thumbnail & Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#EFE6DC] shrink-0">
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-[#2D1508] truncate">
              {product.name}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-[#65544A] mt-0.5">
              <span>{activeUnit.name}</span>
              <span>•</span>
              <span className="font-bold text-[#733617]">₹{activeUnit.price}</span>
            </div>
          </div>
        </div>

        {/* Right: Quantity & Add to Cart Button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quantity Selector (hidden on smallest screens) */}
          <div className="hidden sm:inline-flex items-center bg-[#FAF7F2] border border-[#EFE6DC] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="w-8 h-9 flex items-center justify-center text-[#65544A] hover:text-[#733617] transition disabled:opacity-30 cursor-pointer"
            >
              <Minus size={13} />
            </button>
            <span className="w-8 text-center text-xs font-bold text-[#2D1508]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(quantity + 1)}
              aria-label="Increase quantity"
              className="w-8 h-9 flex items-center justify-center text-[#65544A] hover:text-[#733617] transition cursor-pointer"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            type="button"
            onClick={onAddToCart}
            disabled={adding}
            className="py-2.5 px-5 sm:px-6 rounded-xl bg-[#733617] hover:bg-[#5A290F] text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {added ? (
              <>
                <Check size={15} className="text-green-300" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag size={15} />
                <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
