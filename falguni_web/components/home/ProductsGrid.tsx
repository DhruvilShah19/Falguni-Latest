'use client';
import { useEffect, useState, useRef } from 'react';
import BoutiqueItem from '@/components/ui/BoutiqueItem';
import { getProducts } from '@/lib/firestore';
import type { ProductsModel } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
  limitCount?: number;
  products?: ProductsModel[];
  sliceStart?: number;
  sliceEnd?: number;
}

export default function ProductsGrid({
  title = 'Falguni Favourites',
  subtitle = 'Loved by 1000+ customers across India',
  viewAllHref = '/products?sort=bestseller',
  limitCount = 20,
  products: propProducts,
  sliceStart = 0,
  sliceEnd = 12,
}: Props) {
  const [products, setProducts] = useState<ProductsModel[]>(propProducts ?? []);
  const [loading, setLoading] = useState(!propProducts);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (propProducts) return;
    getProducts(limitCount)
      .then(p => {
        const sorted = [...p].sort((a, b) => {
          if (a.isBestseller && !b.isBestseller) return -1;
          if (!a.isBestseller && b.isBestseller) return 1;
          return 0;
        });
        setProducts(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [limitCount, propProducts]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) return <LoadingSpinner />;
  if (products.length === 0) return null;

  const displayProducts = products.slice(sliceStart, sliceEnd);

  return (
    <section className="py-8 md:py-14 bg-[#FAF7F2]">
      <div className="max-w-[1360px] mx-auto px-4 md:px-8">

        {/* ── Section Header matching mockup ── */}
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-[32px] font-bold text-[#2D1508] tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs md:text-sm text-[#65544A] mt-1 font-medium">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#733617] hover:text-[#5A290F] transition-colors"
              >
                <span>VIEW ALL BESTSELLERS</span>
                <span>→</span>
              </Link>
            )}

            {/* Prev/Next carousel buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                aria-label="Previous products"
                className="w-8 h-8 rounded-full bg-white border border-[#EFE6DC] flex items-center justify-center text-[#2D1508] hover:bg-[#FAF7F2] hover:text-[#733617] shadow-xs transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scroll('right')}
                aria-label="Next products"
                className="w-8 h-8 rounded-full bg-white border border-[#EFE6DC] flex items-center justify-center text-[#2D1508] hover:bg-[#FAF7F2] hover:text-[#733617] shadow-xs transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Products Carousel / Grid ── */}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide flex gap-4 md:gap-5 pb-4 pt-1 snap-x snap-mandatory"
        >
          {displayProducts.map((p) => (
            <div
              key={p.uid || p.productID}
              className="snap-start shrink-0 w-[180px] sm:w-[210px] md:w-[220px]"
            >
              <BoutiqueItem product={p} />
            </div>
          ))}
        </div>

        {/* Mobile View All link */}
        {viewAllHref && (
          <div className="sm:hidden flex justify-center mt-6">
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#733617]"
            >
              <span>VIEW ALL BESTSELLERS</span>
              <span>→</span>
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
