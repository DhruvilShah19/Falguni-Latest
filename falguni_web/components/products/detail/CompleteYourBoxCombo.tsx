'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Check, ShoppingBag } from 'lucide-react';
import type { ProductsModel } from '@/types';

interface CompleteYourBoxComboProps {
  currentProduct: ProductsModel;
  complementaryProducts: ProductsModel[];
  onAddComboToCart: (items: ProductsModel[]) => Promise<void> | void;
}

export default function CompleteYourBoxCombo({
  currentProduct,
  complementaryProducts,
  onAddComboToCart,
}: CompleteYourBoxComboProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Take up to 2 complementary products from Firestore
  const secondaryItems = complementaryProducts.slice(0, 2);

  if (secondaryItems.length === 0) {
    return null; // Don't render if no complementary products available
  }

  const allComboProducts = [currentProduct, ...secondaryItems];

  // Calculate real pricing
  const originalTotal = allComboProducts.reduce((sum, p) => {
    const price = p.unitPrice1 ?? p.price ?? 100;
    return sum + price;
  }, 0);

  // 10% Bundle Savings
  const savings = Math.round(originalTotal * 0.1);
  const bundlePrice = originalTotal - savings;

  const handleAddCombo = async () => {
    setAdding(true);
    try {
      await onAddComboToCart(allComboProducts);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="w-full bg-white border border-[#EFE6DC] rounded-3xl p-6 sm:p-8 mb-8 shadow-xs">
      {/* ── Top Header & Pricing Block ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EFE6DC] mb-6">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1508]">
            Complete Your Falguni Box
          </h3>
          <p className="text-xs text-[#65544A] mt-1 font-normal">
            Add more favourites and save more!
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm text-[#8A796F] line-through">
              ₹{originalTotal}
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#2D1508]">
              ₹{bundlePrice}
            </span>
            <span className="bg-[#EFE2D2] text-[#733617] text-[11px] font-bold px-2 py-0.5 rounded">
              Save ₹{savings}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddCombo}
            disabled={adding}
            className="px-6 py-3 rounded-xl bg-[#733617] hover:bg-[#5A290F] text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {added ? (
              <>
                <Check size={16} className="text-green-300" />
                <span>Bundle Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                <span>{adding ? 'Adding Bundle...' : 'Add Combo to Cart'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── 3-Product Combo Row ── */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 py-2">
        {allComboProducts.map((prod, idx) => {
          const price = prod.unitPrice1 ?? prod.price ?? 100;
          const weight = prod.unitname1 || 'Standard Pack';
          const image = prod.image1 || '/4_1.webp';

          return (
            <div key={prod.uid || idx} className="flex items-center gap-4 sm:gap-6 w-full md:w-auto">
              {/* Product Mini Card */}
              <Link
                href={`/products/${encodeURIComponent(prod.uid || prod.name)}`}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF7F2] border border-[#EFE6DC] hover:border-[#733617]/40 transition-all flex-1 md:flex-initial md:w-56 group"
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-[#EFE6DC] shrink-0">
                  <Image
                    src={image}
                    alt={prod.name}
                    fill
                    sizes="64px"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <h4 className="text-xs font-bold text-[#2D1508] truncate group-hover:text-[#733617] transition-colors">
                    {prod.name}
                  </h4>
                  <p className="text-[11px] text-[#8A796F] mt-0.5">{weight}</p>
                  <p className="text-xs font-bold text-[#2D1508] mt-1">₹{price}</p>
                </div>
              </Link>

              {/* Plus Connector (between cards) */}
              {idx < allComboProducts.length - 1 && (
                <div className="hidden md:flex w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#EFE6DC] items-center justify-center text-[#733617] shrink-0 font-bold">
                  <Plus size={16} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
